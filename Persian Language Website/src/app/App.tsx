import { useState } from "react";
import { 
  Brain, 
  Bot, 
  BarChart3, 
  Calendar, 
  Star, 
  Menu, 
  X, 
  Play, 
  ArrowLeft,
  Trophy,
  Flame,
  Award,
  MessageSquare,
  Camera,
  Volume2,
  Infinity,
  TrendingUp,
  Users,
  Clock,
  Target,
  Zap,
  RefreshCw,
  Smartphone,
  Monitor,
  Wifi,
  Moon,
  CheckCircle2,
  XCircle,
  Sparkles
} from "lucide-react";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 50);
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
      {/* Gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-card/95 backdrop-blur-xl border-b border-border' : 'bg-transparent'}`}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold" style={{ fontFamily: "'Lalezar', sans-serif" }}>منتورا</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-8">
                <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">ویژگی‌ها</a>
                <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors">نحوه کار</a>
                <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors">قیمت‌گذاری</a>
                <a href="#parents" className="text-foreground/80 hover:text-primary transition-colors">برای والدین</a>
                <a href="#schools" className="text-foreground/80 hover:text-primary transition-colors">برای مدارس</a>
                <a href="#blog" className="text-foreground/80 hover:text-primary transition-colors">بلاگ</a>
              </div>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-4">
                <button className="text-foreground/80 hover:text-primary transition-colors">ورود</button>
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105">
                  شروع رایگان
                </button>
              </div>

              {/* Mobile menu button */}
              <button 
                className="lg:hidden text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden py-6 border-t border-border bg-card/95 backdrop-blur-xl">
                <div className="flex flex-col gap-4">
                  <a href="#features" className="text-foreground/80 hover:text-primary transition-colors py-2">ویژگی‌ها</a>
                  <a href="#how-it-works" className="text-foreground/80 hover:text-primary transition-colors py-2">نحوه کار</a>
                  <a href="#pricing" className="text-foreground/80 hover:text-primary transition-colors py-2">قیمت‌گذاری</a>
                  <a href="#parents" className="text-foreground/80 hover:text-primary transition-colors py-2">برای والدین</a>
                  <a href="#schools" className="text-foreground/80 hover:text-primary transition-colors py-2">برای مدارس</a>
                  <a href="#blog" className="text-foreground/80 hover:text-primary transition-colors py-2">بلاگ</a>
                  <button className="text-right text-foreground/80 hover:text-primary transition-colors py-2">ورود</button>
                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all">
                    شروع رایگان
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Right side - Text Content */}
              <div className="text-right order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-semibold">معلم هوش مصنوعی ۲۴/۷ به زبان فارسی</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                  معلم خصوصی هوشمند برای کنکور
                </h1>
                <p className="text-xl lg:text-2xl text-foreground/80 mb-8 leading-relaxed">
                  منتورا هر روز با سطح شما سازگار می‌شود، خودکار خلاهای دانشی شما را پر می‌کند و برنامه مطالعاتی اختصاصی می‌سازد — با کسری از هزینه معلم خصوصی.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105 flex items-center justify-center gap-2">
                    شروع رایگان امروز
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button className="bg-card border border-border px-8 py-4 rounded-lg font-bold text-lg hover:bg-muted transition-all flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    مشاهده نحوه کار
                  </button>
                </div>

                {/* Trust Bar */}
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">مورد اعتماد بیش از</p>
                    <p className="text-2xl font-bold text-primary">۱۰,۰۰۰+ دانش‌آموز</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                    <span className="mr-2 text-foreground/80">۴.۹ از ۲,۴۰۰ نظر</span>
                  </div>
                </div>
              </div>

              {/* Left side - Visual */}
              <div className="order-1 lg:order-2">
                <div className="relative">
                  {/* Main dashboard mockup */}
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">پیشرفت امروز</p>
                        <p className="text-2xl font-bold">۷۸٪</p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">A</span>
                      </div>
                    </div>

                    {/* Heatmap */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-primary/80 rounded-lg p-4 text-right">
                        <p className="text-xs text-primary-foreground/80 mb-1">ریاضی</p>
                        <p className="text-lg font-bold text-primary-foreground">۸۵٪</p>
                      </div>
                      <div className="bg-accent/60 rounded-lg p-4 text-right">
                        <p className="text-xs text-accent-foreground/80 mb-1">فیزیک</p>
                        <p className="text-lg font-bold text-accent-foreground">۷۲٪</p>
                      </div>
                      <div className="bg-destructive/60 rounded-lg p-4 text-right">
                        <p className="text-xs text-destructive-foreground/80 mb-1">شیمی</p>
                        <p className="text-lg font-bold text-destructive-foreground">۶۳٪</p>
                      </div>
                    </div>

                    {/* Exam countdown */}
                    <div className="bg-secondary rounded-lg p-4 text-right">
                      <p className="text-sm text-muted-foreground mb-1">تا کنکور</p>
                      <p className="text-xl font-bold">۱۲۸ روز</p>
                    </div>
                  </div>

                  {/* Floating AI chat bubble */}
                  <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground rounded-2xl rounded-br-none p-4 shadow-xl max-w-xs">
                    <div className="flex items-start gap-2">
                      <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm leading-relaxed">بذار این مفهوم رو یه جور دیگه برات توضیح بدم...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section className="py-20 px-6 lg:px-8 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              کنکور سخته. ابزارهای فعلی شما برای اون ساخته نشدن.
            </h2>
            <p className="text-center text-muted-foreground mb-16 text-lg">منتورا ساخته شد تا هر سه مشکل رو یکجا حل کنه.</p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Problem 1 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-3">برنامه‌های مطالعاتی کلی</h3>
                <p className="text-muted-foreground leading-relaxed">
                  اکثر اپلیکیشن‌ها محتوای یکسانی برای همه می‌دن. هیچ‌کس خاص برای نقاط ضعف شما برنامه نمی‌ریزه.
                </p>
              </div>

              {/* Problem 2 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-3">بدون بازخورد لحظه‌ای</h3>
                <p className="text-muted-foreground leading-relaxed">
                  آزمون می‌دی. نمره می‌گیری. ولی هیچ‌کس نمی‌گه چرا اشتباه کردی یا بعدش چیکار کنی.
                </p>
              </div>

              {/* Problem 3 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-3">معلم خصوصی خیلی گرونه</h3>
                <p className="text-muted-foreground leading-relaxed">
                  معلم‌های خوب ماهی ۵۰۰ هزار تا ۲ میلیون تومان می‌گیرن. همه خانواده‌ها نمی‌تونن این پول رو بدن.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Overview */}
        <section id="features" className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                یک پلتفرم. تمام امکاناتی که برای قبولی در کنکور نیاز داری.
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                منتورا معلم هوش مصنوعی، آزمون تطبیقی، برنامه‌ریزی هوشمند و آنالیز عملکرد رو در یک پلتفرم واحد که با برنامه شما کار می‌کنه ترکیب کرده.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-all">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>موتور یادگیری تطبیقی</h3>
                <p className="text-muted-foreground leading-relaxed">
                  تنظیم سختی لحظه‌ای و مسیرهای آموزشی شخصی‌سازی شده بر اساس عملکرد زنده شما.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-all">
                  <Bot className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>معلم هوش مصنوعی ۲۴/۷</h3>
                <p className="text-muted-foreground leading-relaxed">
                  هر سوالی رو به فارسی بپرس. راه‌حل‌های گام‌به‌گام، سبک‌های توضیح متعدد و رفع شک در هر لحظه.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/30 transition-all">
                  <BarChart3 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>آنالیز عملکرد</h3>
                <p className="text-muted-foreground leading-relaxed">
                  دقیقاً بدون کجایی: نقشه گرمایی نقاط ضعف، پیش‌بینی رتبه، برآورد زمان تسلط، و مقایسه با همسالان.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all group">
                <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/30 transition-all">
                  <Calendar className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Lalezar', sans-serif" }}>برنامه‌ریز هوشمند مطالعه</h3>
                <p className="text-muted-foreground leading-relaxed">
                  هوش مصنوعی برنامه روزانه/هفتگی شما رو بر اساس رتبه هدف و تاریخ آزمون می‌سازه. وقتی عقب می‌افتی خودکار تنظیم می‌شه.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button className="text-primary hover:text-primary/80 font-semibold text-lg flex items-center gap-2 mx-auto">
                مشاهده تمام ویژگی‌ها
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 lg:px-8 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              دانش‌آموزانی که به منتورا سوئیچ کردن. اینها نتیجه‌هاشونه.
            </h2>
            <p className="text-center text-muted-foreground mb-16 text-lg">موفقیت‌های واقعی از دانش‌آموزان واقعی</p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6">
                  از رتبه ۴۵,۰۰۰ تو ۵ ماه رسیدم به ۸,۲۰۰. معلم هوش مصنوعی هر مفهومی که ازش عقب بودم رو بدون قضاوت توضیح داد.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">س</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">سارا م.</p>
                    <p className="text-sm text-muted-foreground">تهران</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6">
                  ماهی ۳ میلیون تومان برای معلم خصوصی می‌دادم. منتورا کسری از این هزینه داره و راستش پیشرفتم رو بهتر از هر معلمی پیگیری می‌کنه.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent font-bold">ا</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">امیر ک.</p>
                    <p className="text-sm text-muted-foreground">اصفهان</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-card border border-border rounded-xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground/90 leading-relaxed mb-6">
                  ویژگی برنامه مطالعاتی اون چیزی بود که همه چیز رو عوض کرد. دقیقاً بهم می‌گفت هر صبح بر اساس نمرات آزمون روز قبلم چی بخونم.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">ن</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">نرگس ت.</p>
                    <p className="text-sm text-muted-foreground">شیراز</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Tutor Spotlight */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Right - Chat mockup */}
              <div className="order-2 lg:order-1">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                  <div className="space-y-4">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-primary/20 rounded-2xl rounded-bl-none p-4 max-w-[80%] text-right">
                        <p className="text-sm">این مسئله فیزیک رو متوجه نمی‌شم. می‌تونی کمک کنی؟</p>
                      </div>
                    </div>
                    
                    {/* AI response */}
                    <div className="flex justify-start">
                      <div className="bg-accent/20 rounded-2xl rounded-br-none p-4 max-w-[80%] text-right">
                        <div className="flex items-start gap-2 mb-2">
                          <Bot className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-semibold">معلم هوش مصنوعی</p>
                        </div>
                        <p className="text-sm leading-relaxed">البته! بذار این مسئله رو با هم گام‌به‌گام حل کنیم. اول بذار اصول اولیه رو بررسی کنیم...</p>
                      </div>
                    </div>

                    {/* Step by step */}
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-xl p-4 max-w-[80%] text-right">
                        <p className="text-xs text-muted-foreground mb-2">گام ۱ از ۳</p>
                        <p className="text-sm">نیروهای وارد بر جسم رو شناسایی می‌کنیم:</p>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                          <li>نیروی جاذبه (mg)</li>
                          <li>نیروی عمودی (N)</li>
                          <li>نیروی اصطکاک (f)</li>
                        </ul>
                      </div>
                    </div>

                    {/* Image uploaded indicator */}
                    <div className="flex justify-end">
                      <div className="bg-muted rounded-xl p-3 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">عکس مسئله آپلود شد</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left - Description */}
              <div className="text-right order-1 lg:order-2">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                  مثل داشتن یک معلم برتر تو جیبت — ۲۴/۷
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  هر سوال کنکوری رو به فارسی بپرس. معلم هوش مصنوعی منتورا توضیحات گام‌به‌گام می‌ده، از روش‌های مختلف تدریس استفاده می‌کنه و تاریخچه شما رو به یاد می‌آره تا هر پاسخ بر اساس چیزایی که قبلاً یاد گرفتی بسازه.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">سوال و جواب به فارسی</p>
                      <p className="text-sm text-muted-foreground">هر سوالی رو به زبان مادریت بپرس</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">آپلود عکس (عکس از کتابت)</p>
                      <p className="text-sm text-muted-foreground">از هر سوالی عکس بگیر و راه‌حل فوری دریافت کن</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">حالت «ساده توضیح بده»</p>
                      <p className="text-sm text-muted-foreground">بین توضیح مبتدی و پیشرفته سوئیچ کن</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">تعامل صوتی و متنی</p>
                      <p className="text-sm text-muted-foreground">با معلم هوش مصنوعیت حرف بزن یا تایپ کن</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Dashboard Spotlight */}
        <section className="py-20 px-6 lg:px-8 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Right - Description */}
              <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                  دقیقاً بدون کجایی. دقیقاً بدون بعدش چیکار کنی.
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  موتور عملکرد منتورا هر سوالی که تا حالا جواب دادی رو پیگیری می‌کنه و یه نقشه زنده از دانش شما می‌سازه. رتبه کنکورت رو امروز پیش‌بینی می‌کنه و بهت می‌گه برای بهتر کردنش چی بخونی.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">نقشه گرمایی نقاط ضعف</p>
                      <p className="text-sm text-muted-foreground">نقشه بصری از قوی‌ترین و ضعیف‌ترین حوزه‌هات</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">پیش‌بینی رتبه کنکور</p>
                      <p className="text-sm text-muted-foreground">برآورد رتبه بر اساس عملکرد فعلی</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">زمان-تا-تسلط</p>
                      <p className="text-sm text-muted-foreground">پیش‌بینی تاریخی که برای هر موضوع آماده می‌شی</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">مقایسه با همسالان</p>
                      <p className="text-sm text-muted-foreground">ببین در مقابل دانش‌آموزان با هدف مشابه کجایی</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left - Dashboard mockup */}
              <div>
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                  {/* Readiness score circle */}
                  <div className="flex justify-center mb-8">
                    <div className="relative w-40 h-40">
                      <svg className="transform -rotate-90 w-40 h-40">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted" />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.78)}`} className="text-primary" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold">۷۸٪</span>
                        <span className="text-xs text-muted-foreground">آمادگی</span>
                      </div>
                    </div>
                  </div>

                  {/* Weakness heatmap */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold mb-1">ریاضی</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary w-12 text-left">۸۵٪</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold mb-1">فیزیک</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-accent w-12 text-left">۷۲٪</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-semibold mb-1">شیمی</p>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-destructive rounded-full" style={{ width: '63%' }}></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-destructive w-12 text-left">۶۳٪</span>
                    </div>
                  </div>

                  {/* Rank prediction */}
                  <div className="mt-6 p-4 bg-secondary rounded-lg text-right">
                    <p className="text-sm text-muted-foreground mb-1">پیش‌بینی رتبه کنکور</p>
                    <p className="text-2xl font-bold text-primary">۱۲,۳۰۰</p>
                    <p className="text-xs text-muted-foreground mt-1">بهبود ۲,۸۰۰ رتبه‌ای از ماه گذشته</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Study Planner Spotlight */}
        <section className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Right - Calendar mockup */}
              <div className="order-2 lg:order-1">
                <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-primary/20 rounded-full text-xs font-semibold text-primary">
                        تولید شده با هوش مصنوعی
                      </div>
                    </div>
                    <h3 className="text-lg font-bold">برنامه این هفته</h3>
                  </div>

                  {/* Calendar days */}
                  <div className="space-y-3">
                    {/* Saturday */}
                    <div className="border-r-4 border-primary pr-4">
                      <p className="text-sm font-semibold mb-2">شنبه</p>
                      <div className="space-y-2">
                        <div className="bg-primary/20 rounded-lg p-3 text-right">
                          <p className="text-xs text-primary font-semibold mb-1">ریاضی</p>
                          <p className="text-xs text-muted-foreground">مثلثات - ۲ ساعت</p>
                        </div>
                        <div className="bg-accent/20 rounded-lg p-3 text-right">
                          <p className="text-xs text-accent font-semibold mb-1">فیزیک</p>
                          <p className="text-xs text-muted-foreground">الکتریسیته - ۱.۵ ساعت</p>
                        </div>
                      </div>
                    </div>

                    {/* Sunday */}
                    <div className="border-r-4 border-accent pr-4">
                      <p className="text-sm font-semibold mb-2">یکشنبه</p>
                      <div className="space-y-2">
                        <div className="bg-destructive/20 rounded-lg p-3 text-right">
                          <p className="text-xs text-destructive font-semibold mb-1">شیمی</p>
                          <p className="text-xs text-muted-foreground">مولکول‌ها - ۲ ساعت</p>
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-right">
                          <p className="text-xs font-semibold mb-1">آزمون جامع</p>
                          <p className="text-xs text-muted-foreground">۱ ساعت</p>
                        </div>
                      </div>
                    </div>

                    {/* Monday */}
                    <div className="border-r-4 border-primary pr-4 opacity-60">
                      <p className="text-sm font-semibold mb-2">دوشنبه</p>
                      <div className="bg-secondary rounded-lg p-3 text-right">
                        <p className="text-xs text-muted-foreground">در حال تولید...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left - Description */}
              <div className="text-right order-1 lg:order-2">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                  برنامه مطالعاتی که برات فکر می‌کنه — و هر روز سازگار می‌شه
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  رتبه هدف و تاریخ آزمونت رو به منتورا بگو. کل مسیرت رو می‌سازه. دیروز عقب افتادی؟ برنامه امشب تنظیم می‌شه. همیشه دقیقاً می‌دونی فردا چی بخونی.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">برنامه‌ریزی بر اساس هدف</p>
                      <p className="text-sm text-muted-foreground">رتبه هدفت رو تعیین کن، منتورا مسیر رو می‌سازه</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">برنامه روزانه هوش مصنوعی</p>
                      <p className="text-sm text-muted-foreground">برنامه‌های خودکار بر اساس پیشرفتت</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">آگاه از فرسودگی</p>
                      <p className="text-sm text-muted-foreground">الگوهای اضافه بار رو تشخیص می‌ده و شدت رو تنظیم می‌کنه</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1">شمارش معکوس آزمون</p>
                      <p className="text-sm text-muted-foreground">جدول زمانی معکوس‌سازی شده از روز آزمون</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gamification */}
        <section className="py-20 px-6 lg:px-8 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                بیشتر بخون. با انگیزه بمون. سطح بالا برو.
              </h2>
              <p className="text-xl text-muted-foreground">منتورا کارِ سخت رو به پیشرفت تبدیل می‌کنه — چون واقعاً هست.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Leaderboards */}
              <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Lalezar', sans-serif" }}>جداول امتیازی</h3>
                <p className="text-muted-foreground text-sm">با دانش‌آموزان هم‌سطحت رقابت کن</p>
              </div>

              {/* Streaks */}
              <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Flame className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Lalezar', sans-serif" }}>استریک‌ها</h3>
                <p className="text-muted-foreground text-sm">شعله مطالعه روزانه‌ات رو روشن نگه دار</p>
              </div>

              {/* XP & Levels */}
              <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Lalezar', sans-serif" }}>XP و سطوح</h3>
                <p className="text-muted-foreground text-sm">برای هر جلسه امتیاز کسب کن</p>
              </div>

              {/* Badges */}
              <div className="bg-card border border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Lalezar', sans-serif" }}>نشان‌ها</h3>
                <p className="text-muted-foreground text-sm">دستاوردها رو با تسلط بر موضوعات باز کن</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section id="pricing" className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                کمتر از یک جلسه کلاس خصوصی در ماه.
              </h2>
              <p className="text-xl text-muted-foreground">دسترسی کامل به معلم خصوصی هوش مصنوعی کمتر از ۱۰٪ هزینه معلم انسانی.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-card border border-border rounded-2xl p-8 text-right hover:border-primary/50 transition-all">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Lalezar', sans-serif" }}>رایگان</h3>
                  <p className="text-muted-foreground">برای دانش‌آموزانی که منتورا رو کاوش می‌کنن</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">۰</span>
                  <span className="text-muted-foreground mr-2">تومان/ماه</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">۱۰ سوال معلم هوش مصنوعی در روز</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">داشبورد عملکرد پایه</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">۳ جلسه تمرین تطبیقی در هفته</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">۱ آزمون جامع در ماه</span>
                  </li>
                </ul>
                <button className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-all">
                  شروع رایگان
                </button>
              </div>

              {/* Student Plan */}
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary rounded-2xl p-8 text-right relative">
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                  محبوب‌ترین
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Lalezar', sans-serif" }}>پلن دانش‌آموزی</h3>
                  <p className="text-muted-foreground">برای کاندیداهای جدی کنکور</p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-bold">۲۹۹,۰۰۰</span>
                  <span className="text-muted-foreground mr-2">تومان/ماه</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">سوالات نامحدود معلم هوش مصنوعی</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">عکس → راه‌حل (هر سوالی رو عکس بگیر)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">نقشه گرمایی کامل نقاط ضعف</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">پیش‌بینی رتبه کنکور (زنده)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">تمرین تطبیقی نامحدود</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">آزمون‌های جامع نامحدود</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">برنامه مطالعه روزانه هوش مصنوعی</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">داشبورد والدین</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">حالت آفلاین</span>
                  </li>
                </ul>
                <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:bg-primary/90 transition-all hover:scale-105">
                  شروع ۷ روز رایگان
                </button>
              </div>
            </div>

            <div className="text-center mt-12">
              <button className="text-primary hover:text-primary/80 font-semibold text-lg flex items-center gap-2 mx-auto">
                مشاهده قیمت‌گذاری کامل
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Parent Trust Block */}
        <section id="parents" className="py-20 px-6 lg:px-8 bg-card/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-right">
                <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
                  والدین: بدونید چه اتفاقی داره می‌افته. هر هفته.
                </h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  منتورا شما رو با گزارش‌های خودکار هفتگی، هشدارهای پیشرفت لحظه‌ای و اعلان‌های نقاط ضعف در جریان نگه می‌داره — تا هیچ‌وقت نیازی نباشه نگران باشید آیا فرزندتون مسیر درستی رو دنبال می‌کنه.
                </p>
                <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all hover:scale-105 flex items-center gap-2">
                  کاوش داشبورد والدین
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6 text-right">
                  <BarChart3 className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-bold mb-2">پیگیری پیشرفت لحظه‌ای</h4>
                  <p className="text-sm text-muted-foreground">نمای زنده ساعات مطالعه، جلسات و عملکرد</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-right">
                  <MessageSquare className="w-8 h-8 text-accent mb-3" />
                  <h4 className="font-bold mb-2">گزارش‌های خودکار هفتگی</h4>
                  <p className="text-sm text-muted-foreground">گزارش PDF دقیق هر هفته به ایمیلتون</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-right">
                  <Target className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-bold mb-2">هشدارهای نقاط ضعف</h4>
                  <p className="text-sm text-muted-foreground">وقتی فرزندتون تو یه موضوع خاص عقب می‌افته مطلع بشید</p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6 text-right">
                  <TrendingUp className="w-8 h-8 text-accent mb-3" />
                  <h4 className="font-bold mb-2">روندهای عملکرد</h4>
                  <p className="text-sm text-muted-foreground">نمودارهای عملکرد ۳۰/۶۰/۹۰ روزه، نه فقط نمره امروز</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Schools */}
        <section id="schools" className="py-20 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              آماده‌سازی کنکور مبتنی بر هوش مصنوعی رو به همه دانش‌آموزان مدرسه‌تون بیارید
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              پلتفرم سازمانی منتورا به مدارس یک سیستم یادگیری مقیاس‌پذیر و داده‌محور می‌ده — با داشبورد برای معلم‌ها، آنالیز برای مدیران و هوش مصنوعی شخصی‌سازی شده برای هر دانش‌آموز.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all hover:scale-105">
                رزرو دمو
              </button>
              <button className="bg-card border border-border px-8 py-4 rounded-lg font-bold hover:bg-muted transition-all">
                تماس با تیم فروش مدارس
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-primary/20 to-accent/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Lalezar', sans-serif" }}>
              همین امروز شروع به مطالعه هوشمندانه‌تر کن.
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              به بیش از ۱۰,۰۰۰ دانش‌آموز کنکور که از منتورا استفاده می‌کنن بپیوند. شروع رایگان. بدون تعهد.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary text-primary-foreground px-10 py-5 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all hover:scale-105">
                ساخت حساب رایگان
              </button>
              <button className="bg-card border border-border px-10 py-5 rounded-lg font-bold text-lg hover:bg-muted transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                مشاهده دمو
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 lg:px-8 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              {/* Logo and tagline */}
              <div className="text-right">
                <div className="flex items-center gap-2 mb-4 justify-end">
                  <span className="text-2xl font-bold" style={{ fontFamily: "'Lalezar', sans-serif" }}>منتورا</span>
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">معلم خصوصی هوش مصنوعی شما — همیشه روشن، همیشه سازگار</p>
              </div>

              {/* Product */}
              <div className="text-right">
                <h4 className="font-bold mb-4">محصول</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-primary transition-colors">ویژگی‌ها</a></li>
                  <li><a href="#pricing" className="hover:text-primary transition-colors">قیمت‌گذاری</a></li>
                  <li><a href="#how-it-works" className="hover:text-primary transition-colors">نحوه کار</a></li>
                  <li><a href="#blog" className="hover:text-primary transition-colors">بلاگ</a></li>
                </ul>
              </div>

              {/* For */}
              <div className="text-right">
                <h4 className="font-bold mb-4">برای</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#parents" className="hover:text-primary transition-colors">برای والدین</a></li>
                  <li><a href="#schools" className="hover:text-primary transition-colors">برای مدارس</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div className="text-right">
                <h4 className="font-bold mb-4">قانونی</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">حریم خصوصی</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">شرایط استفاده</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">ساخته شده برای دانش‌آموزان ایرانی 🇮🇷</p>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">اینستاگرام</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">تلگرام</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">لینکدین</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">توییتر</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
