import { useState, useEffect } from 'react';
import { Phone, MapPin, User as UserIcon, Mail, CreditCard, Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Captcha, Honeypot } from './ui/captcha';
import type { User } from '../App';
import { SETTLEMENTS, STREETS_BY_SETTLEMENT } from '../utils/settlements';
import { hashPassword, verifyPassword, sanitizeInput, isValidPinCode, RateLimiter, isSecureConnection } from '../utils/security';
import { isValidAdminPassword, SECURITY_CONFIG } from '../utils/adminConfig';
import { 
  rateLimiter, 
  spamDetector, 
  ipLimiter, 
  ActionType, 
  debounce, 
  throttle,
  createHoneypot 
} from '../utils/antiSpam';
import { DataIsolationManager, DataMigration } from '../utils/dataIsolation';
import { toast } from 'sonner';

interface AuthScreenProps {
  onAuth: (user: User) => void;
  onAdminAuth: () => void;
}

type AuthState = 'login' | 'register' | 'setPinCode' | 'forgotPin';

// Initialize rate limiter (legacy - keeping for backward compatibility)
const loginRateLimiter = new RateLimiter(
  SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
  15 * 60 * 1000, // 15 minutes window
  SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000 // lockout duration
);

// Initialize honeypot
const honeypot = createHoneypot();

export function AuthScreen({ onAuth, onAdminAuth }: AuthScreenProps) {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hasAnyUsers, setHasAnyUsers] = useState(false); // Changed from registeredUsers array
  const [tempUserData, setTempUserData] = useState<Omit<User, 'pinCode'> | null>(null);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [honeypotValue, setHoneypotValue] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const [formData, setFormData] = useState({
    phone: '',
    pinCode: '',
    pinCodeConfirm: '',
    name: '',
    email: '',
    accountNumber: '',
    settlement: '',
    street: '',
    houseNumber: '',
    apartment: '',
    adminPassword: ''
  });

  const [showPinCode, setShowPinCode] = useState(false);
  const [showPinCodeConfirm, setShowPinCodeConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);

  // Check if any users exist and handle migration
  useEffect(() => {
    // Check for legacy storage and migrate if needed
    const legacyUsers = localStorage.getItem('registeredUsers');
    if (legacyUsers) {
      console.warn('[SECURITY] Migrating from insecure storage...');
      DataMigration.migrateFromLegacyStorage().then(() => {
        console.log('[SECURITY] Migration completed');
        setHasAnyUsers(DataIsolationManager.hasAnyUsers());
        setAuthState('login');
      });
    } else {
      // Check for any users in secure storage
      const anyUsers = DataIsolationManager.hasAnyUsers();
      setHasAnyUsers(anyUsers);
      setAuthState(anyUsers ? 'login' : 'register');
    }
    
    // Check for saved credentials (keeping for remember me feature)
    const savedPhone = localStorage.getItem('rememberedPhone');
    const savedPinCode = localStorage.getItem('rememberedPinCode');
    if (savedPhone && savedPinCode) {
      setFormData(prev => ({ ...prev, phone: savedPhone, pinCode: savedPinCode }));
      setRememberMe(true);
    }
  }, []);
  
  const availableStreets = formData.settlement ? STREETS_BY_SETTLEMENT[formData.settlement] || [] : [];

  const handleStreetInput = (value: string) => {
    setFormData({ ...formData, street: value });
    
    if (value.trim().length > 0 && formData.settlement) {
      const filtered = availableStreets.filter(street =>
        street.toLowerCase().includes(value.toLowerCase())
      );
      setStreetSuggestions(filtered);
      setShowStreetSuggestions(true);
    } else {
      setStreetSuggestions([]);
      setShowStreetSuggestions(false);
    }
  };

  const selectStreet = (street: string) => {
    setFormData({ ...formData, street });
    setShowStreetSuggestions(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    // Check honeypot (bot detection)
    if (honeypot.isBot(honeypotValue)) {
      console.warn('[SECURITY] Bot detected via honeypot');
      setIsLoading(false);
      return; // Silent fail for bots
    }
    
    // Check IP rate limiting
    const ipCheck = ipLimiter.checkIP();
    if (!ipCheck.allowed) {
      toast.error(ipCheck.message);
      setIsLoading(false);
      return;
    }
    ipLimiter.recordRequest();
    
    if (isAdminMode) {
      // Admin login with enhanced rate limiting
      const adminRateLimit = rateLimiter.checkLimit('admin', ActionType.ADMIN_LOGIN);
      if (!adminRateLimit.allowed) {
        toast.error(adminRateLimit.message);
        setIsLoading(false);
        return;
      }
      
      // Require CAPTCHA after 2 failed attempts
      if (loginAttempts >= 2 && !captchaVerified) {
        toast.error('Пожалуйста, пройдите проверку безопасности');
        setIsLoading(false);
        return;
      }
      
      if (isValidAdminPassword(formData.adminPassword)) {
        rateLimiter.recordAttempt('admin', ActionType.ADMIN_LOGIN, true);
        setLoginAttempts(0);
        setCaptchaVerified(false);
        onAdminAuth();
      } else {
        rateLimiter.recordAttempt('admin', ActionType.ADMIN_LOGIN, false);
        setLoginAttempts(prev => prev + 1);
        setLoginError('Неверные учетные данные');
        setIsLoading(false);
        toast.error('Неверный пароль администратора');
      }
      return;
    }

    if (!formData.phone || !formData.pinCode) {
      setLoginError('Введите номер телефона и пин-код');
      setIsLoading(false);
      return;
    }

    // Check advanced rate limiting
    const rateLimit = rateLimiter.checkLimit(formData.phone, ActionType.LOGIN);
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message);
      setLoginError(rateLimit.message!);
      setIsLoading(false);
      return;
    }
    
    // Check legacy rate limiting (backward compatibility)
    const rateLimitCheck = loginRateLimiter.checkLimit(formData.phone);
    if (rateLimitCheck.isLocked) {
      setLoginError(`Слишком много попыток входа. Попробуйте снова через ${rateLimitCheck.remainingTime} минут`);
      setIsLoading(false);
      return;
    }
    
    // Require CAPTCHA after 3 failed attempts
    if (loginAttempts >= 3 && !captchaVerified) {
      toast.error('Пожалуйста, пройдите проверку безопасности');
      setIsLoading(false);
      return;
    }

    const user = DataIsolationManager.getUserByPhone(formData.phone);
    
    if (!user) {
      loginRateLimiter.recordAttempt(formData.phone);
      rateLimiter.recordAttempt(formData.phone, ActionType.LOGIN, false);
      setLoginAttempts(prev => prev + 1);
      const remaining = loginRateLimiter.getRemainingAttempts(formData.phone);
      setLoginError(`Неверные учетные данные. Осталось попыток: ${remaining}`);
      setIsLoading(false);
      toast.warning(`Осталось попыток: ${remaining}`);
      return;
    }

    // Verify PIN code with hash
    const isPinValid = await verifyPassword(formData.pinCode, user.pinCode);
    
    if (isPinValid) {
      // Reset rate limiters on successful login
      loginRateLimiter.resetAttempts(formData.phone);
      rateLimiter.reset(formData.phone, ActionType.LOGIN);
      setLoginAttempts(0);
      setCaptchaVerified(false);
      
      // Save credentials if "Remember me" is checked
      if (rememberMe) {
        const hashedPin = await hashPassword(formData.pinCode);
        localStorage.setItem('rememberedPhone', formData.phone);
        localStorage.setItem('rememberedPinCode', hashedPin);
      } else {
        localStorage.removeItem('rememberedPhone');
        localStorage.removeItem('rememberedPinCode');
      }
      
      setIsLoading(false);
      toast.success('Вход выполнен успешно!');
      onAuth(user);
    } else {
      loginRateLimiter.recordAttempt(formData.phone);
      rateLimiter.recordAttempt(formData.phone, ActionType.LOGIN, false);
      setLoginAttempts(prev => prev + 1);
      const remaining = loginRateLimiter.getRemainingAttempts(formData.phone);
      setLoginError(`Неверные учетные данные. Осталось попыток: ${remaining}`);
      setIsLoading(false);
      toast.warning(`Осталось попыток: ${remaining}`);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check honeypot
    if (honeypot.isBot(honeypotValue)) {
      console.warn('[SECURITY] Bot detected via honeypot');
      return; // Silent fail for bots
    }
    
    // Check IP rate limiting
    const ipCheck = ipLimiter.checkIP();
    if (!ipCheck.allowed) {
      toast.error(ipCheck.message);
      return;
    }
    ipLimiter.recordRequest();
    
    // Check registration rate limit
    const rateLimit = rateLimiter.checkLimit(formData.phone || 'anonymous', ActionType.REGISTRATION);
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message);
      alert(rateLimit.message);
      return;
    }

    if (!formData.name || !formData.email || !formData.accountNumber || 
        !formData.settlement || !formData.street || !formData.houseNumber || 
        !formData.apartment || !formData.phone) {
      toast.error('Заполните все обязательные поля');
      alert('Заполните все обязательные поля');
      return;
    }

    if (!agreedToTerms) {
      toast.warning('Необходимо согласие на обработку персональных данных');
      alert('Необходимо согласие на обработку персональных данных');
      return;
    }
    
    // Spam detection on name and email
    const nameSpamCheck = spamDetector.isSpam(formData.name, formData.phone);
    if (nameSpamCheck.isSpam) {
      console.warn('[SECURITY] Spam detected in name:', nameSpamCheck.reason);
      toast.error('Обнаружена подозрительная активность. Пожалуйста, используйте корректные данные.');
      return;
    }
    
    const emailSpamCheck = spamDetector.isSpam(formData.email, formData.phone);
    if (emailSpamCheck.isSpam) {
      console.warn('[SECURITY] Spam detected in email:', emailSpamCheck.reason);
      toast.error('Обнаружена подозрительная активность. Пожалуйста, используйте корректные данные.');
      return;
    }

    // Check if phone already registered
    if (DataIsolationManager.getUserByPhone(formData.phone)) {
      rateLimiter.recordAttempt(formData.phone, ActionType.REGISTRATION, false);
      toast.error('Пользователь с таким номером уже зарегистрирован');
      alert('Пользователь с таким номером телефона уже зарегистрирован');
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(formData.name);
    const sanitizedEmail = sanitizeInput(formData.email);

    // Save temporary user data without pin code
    const tempUser: Omit<User, 'pinCode'> = {
      phone: formData.phone,
      address: `${formData.settlement}, ${formData.street}, д. ${formData.houseNumber}, кв. ${formData.apartment}`,
      settlement: formData.settlement,
      street: formData.street,
      houseNumber: formData.houseNumber,
      apartment: formData.apartment,
      name: sanitizedName,
      email: sanitizedEmail,
      accountNumber: formData.accountNumber
    };

    setTempUserData(tempUser);
    setAuthState('setPinCode');
    setFormData({ ...formData, pinCode: '', pinCodeConfirm: '' });
    toast.success('Данные сохранены. Установите PIN-код.');
  };

  const handleSetPinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.pinCode || !formData.pinCodeConfirm) {
      alert('Введите и подтвердите пин-код');
      setIsLoading(false);
      return;
    }

    if (formData.pinCode.length !== 4 && formData.pinCode.length !== 6) {
      alert('Пин-код должен содержать 4 или 6 цифр');
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(formData.pinCode)) {
      alert('Пин-код должен содержать только цифры');
      setIsLoading(false);
      return;
    }

    if (formData.pinCode !== formData.pinCodeConfirm) {
      alert('Пин-коды не совпадают');
      setIsLoading(false);
      return;
    }

    if (!tempUserData) return;

    // Hash the PIN code before storing
    const hashedPin = await hashPassword(formData.pinCode);

    const newUser: User = {
      ...tempUserData,
      pinCode: hashedPin
    };

    DataIsolationManager.addUser(newUser);
    setTempUserData(null);
    setIsLoading(false);
    onAuth(newUser);
  };

  const handleForgotPin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.accountNumber) {
      alert('Введите номер телефона и лицевой счет');
      return;
    }

    const user = DataIsolationManager.getUserByPhone(formData.phone);
    
    if (!user || user.accountNumber !== formData.accountNumber) {
      alert('Пользователь не найден. Проверьте введенные данные.');
      return;
    }

    // Set temp user data and go to pin code reset
    setTempUserData(user);
    setAuthState('setPinCode');
    setFormData({ ...formData, pinCode: '', pinCodeConfirm: '' });
  };

  const handleResetPinCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.pinCode || !formData.pinCodeConfirm) {
      alert('Введите и подтвердите новый пин-код');
      setIsLoading(false);
      return;
    }

    if (formData.pinCode.length !== 4 && formData.pinCode.length !== 6) {
      alert('Пин-код должен содержать 4 или 6 цифр');
      setIsLoading(false);
      return;
    }

    if (!/^\d+$/.test(formData.pinCode)) {
      alert('Пин-код должен содержать только цифры');
      setIsLoading(false);
      return;
    }

    if (formData.pinCode !== formData.pinCodeConfirm) {
      alert('Пин-коды не совпадают');
      setIsLoading(false);
      return;
    }

    if (!tempUserData) return;

    // Hash the new PIN code before storing
    const hashedPin = await hashPassword(formData.pinCode);

    const updatedUser: User = {
      ...tempUserData,
      pinCode: hashedPin
    };

    DataIsolationManager.updateUser(updatedUser);
    setTempUserData(null);
    setIsLoading(false);
    onAuth(updatedUser);
  };

  // Login Screen
  if (authState === 'login' && !isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mx-auto flex items-center justify-center mb-2">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Вход в систему</CardTitle>
            <CardDescription>
              Введите номер телефона и пин-код
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Номер теефона
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCode" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Пин-код
                </Label>
                <div className="relative">
                  <Input
                    id="pinCode"
                    type={showPinCode ? "text" : "password"}
                    placeholder="Введите пин-код"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    maxLength={6}
                    pattern="[0-9]*"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinCode(!showPinCode)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPinCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-1"
                />
                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                  Запомнить меня
                </Label>
              </div>
              
              {/* Honeypot field (hidden from users, visible to bots) */}
              <Honeypot 
                name={honeypot.fieldName}
                value={honeypotValue}
                onChange={setHoneypotValue}
              />
              
              {/* CAPTCHA after 3 failed attempts */}
              {loginAttempts >= 3 && (
                <Captcha 
                  onVerify={setCaptchaVerified}
                  required={true}
                />
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('forgotPin');
                    setFormData({ ...formData, pinCode: '', accountNumber: '' });
                  }}
                  className="text-sm text-blue-600 hover:underline block w-full"
                >
                  Забыли пин-код?
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('register');
                    setFormData({
                      phone: '',
                      pinCode: '',
                      pinCodeConfirm: '',
                      name: '',
                      email: '',
                      accountNumber: '',
                      settlement: '',
                      street: '',
                      houseNumber: '',
                      apartment: '',
                      adminPassword: ''
                    });
                  }}
                  className="text-sm text-blue-600 hover:underline block w-full"
                >
                  Нет аккаунта? Зарегистрируйтесь
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdminMode(true)}
                  className="text-sm text-gray-600 hover:underline block w-full"
                >
                  Войти как администратор
                </button>
              </div>

              {loginError && (
                <div className="text-red-500 text-sm mt-2">
                  {loginError}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Login
  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mx-auto flex items-center justify-center mb-2">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Вход администратора</CardTitle>
            <CardDescription>
              Введите пароль для доступа к панели управления
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Пароль администратора
                </Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPinCode ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinCode(!showPinCode)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPinCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Для демонстрации используйте: admin123</p>
              </div>
              
              {/* Honeypot for admin login too */}
              <Honeypot 
                name={honeypot.fieldName}
                value={honeypotValue}
                onChange={setHoneypotValue}
              />
              
              {/* CAPTCHA after 2 failed attempts for admin */}
              {loginAttempts >= 2 && (
                <Captcha 
                  onVerify={setCaptchaVerified}
                  required={true}
                />
              )}

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти как администратор'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminMode(false);
                    setFormData({ ...formData, adminPassword: '' });
                  }}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Вернуться к входу пользователя
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration Screen
  if (authState === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center space-y-2 pb-4 sticky top-0 bg-white z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mx-auto flex items-center justify-center mb-2">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Регистрация</CardTitle>
            <CardDescription>
              Заполните данные для регистрации в системе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Имя *
                </Label>
                <Input
                  id="name"
                  placeholder="Иван Иванов"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Номер телефона *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Лицевой счет *
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="123456789"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="settlement" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Населенный пункт *
                </Label>
                <select
                  id="settlement"
                  value={formData.settlement}
                  onChange={(e) => setFormData({ ...formData, settlement: e.target.value, street: '' })}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Выберите населенный пункт</option>
                  {SETTLEMENTS.map((settlement) => (
                    <option key={settlement} value={settlement}>
                      {settlement}
                    </option>
                  ))}
                </select>
              </div>

              {formData.settlement && (
                <div className="space-y-2">
                  <Label htmlFor="street" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Улица *
                  </Label>
                  <div className="relative">
                    <Input
                      id="street"
                      placeholder="Начните вводить улицу"
                      value={formData.street}
                      onChange={(e) => handleStreetInput(e.target.value)}
                      required
                    />
                    {showStreetSuggestions && streetSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto mt-1">
                        {streetSuggestions.map((street) => (
                          <div
                            key={street}
                            className="p-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => selectStreet(street)}
                          >
                            {street}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="houseNumber" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Дом *
                  </Label>
                  <Input
                    id="houseNumber"
                    placeholder="1"
                    value={formData.houseNumber}
                    onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Квартира *
                  </Label>
                  <Input
                    id="apartment"
                    placeholder="1"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  Я согласен с <a href="#" className="text-blue-600 hover:underline">условиями обработки персональных данных</a>
                </Label>
              </div>
              
              {/* Honeypot for registration */}
              <Honeypot 
                name={honeypot.fieldName}
                value={honeypotValue}
                onChange={setHoneypotValue}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Продолжить
              </Button>

              {hasAnyUsers && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setAuthState('login')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Уже есть аккаунт? Войдите
                  </button>
                </div>
              )}

              <div className="text-center pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAdminMode(true)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Войти как администратор
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Set Pin Code Screen
  if (authState === 'setPinCode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl mx-auto flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {tempUserData?.pinCode ? 'Смена пин-кода' : 'Установка пин-кода'}
            </CardTitle>
            <CardDescription>
              Придумайте надежный пин-код из 4 или 6 цифр для входа в систему
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={tempUserData?.pinCode ? handleResetPinCode : handleSetPinCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pinCode" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Пин-код (4 или 6 цифр)
                </Label>
                <div className="relative">
                  <Input
                    id="pinCode"
                    type={showPinCode ? "text" : "password"}
                    placeholder="Введите пин-код"
                    value={formData.pinCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, pinCode: value });
                    }}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinCode(!showPinCode)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPinCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pinCodeConfirm" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Подтвердите пин-код
                </Label>
                <div className="relative">
                  <Input
                    id="pinCodeConfirm"
                    type={showPinCodeConfirm ? "text" : "password"}
                    placeholder="Повторите пин-код"
                    value={formData.pinCodeConfirm}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, pinCodeConfirm: value });
                    }}
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinCodeConfirm(!showPinCodeConfirm)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPinCodeConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {formData.pinCode && formData.pinCodeConfirm && (
                <div className={`p-3 rounded-lg border ${
                  formData.pinCode === formData.pinCodeConfirm 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-sm ${
                    formData.pinCode === formData.pinCodeConfirm 
                      ? 'text-green-700' 
                      : 'text-red-700'
                  }`}>
                    {formData.pinCode === formData.pinCodeConfirm 
                      ? '✓ Пин-коды совпадают' 
                      : '✗ Пин-коды не совпадают'}
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Важно:</strong> Запомните ваш пин-код. Он потребуется для каждого входа в систему.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!formData.pinCode || !formData.pinCodeConfirm || formData.pinCode !== formData.pinCodeConfirm}
              >
                {tempUserData?.pinCode ? 'Сменить пин-код' : 'Установить пин-код'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot Pin Screen
  if (authState === 'forgotPin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl mx-auto flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Восстановление пин-кода</CardTitle>
            <CardDescription>
              Введите ваш номер телефона и лицевой счет для восстановления доступа
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Номер телефона
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Лицевой счет
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="123456789"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  После проверки данных вы сможете установить новый пин-код
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Восстановить доступ
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthState('login');
                    setFormData({ ...formData, accountNumber: '' });
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Вернуться к входу
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}