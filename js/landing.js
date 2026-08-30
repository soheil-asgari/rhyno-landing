/* ============================================================
   Rhyno ERP Landing Page - JavaScript Data & Render Logic
   Extracted from index.html for modularity
   ============================================================ */

/* ========================================================
   1. DATA: 8 KEY HIGHLIGHTS
   ======================================================== */
const highlightsData = [
  {
    icon: 'network',
    title: 'یکپارچگی کامل فرآیندها',
    desc: 'اتصال مستقیم مالی، منابع انسانی، قرارداد، انبار، مکاتبات، اسناد و مالیات بدون جزیره‌ای شدن داده‌ها.'
  },
  {
    icon: 'bar-chart-3',
    title: 'داشبوردهای تصمیم‌ساز',
    desc: 'نماهای مدیریتی و هوشمند برای مدیرعامل، مدیر مالی، قراردادها، انبار، حسابرسی و کارشناسان مالیاتی.'
  },
  {
    icon: 'scan-text',
    title: 'اتوماسیون هوشمند اسناد و فاکتور',
    desc: 'OCR قدرتمند فارسی، تشخیص خودکار موجودیت، نرمال‌سازی ارز و تاریخ جلالی با تبدیل مستقیم به اسناد مالی.'
  },
  {
    icon: 'git-merge',
    title: 'گردش‌کار قابل طراحی و ردیابی',
    desc: 'فرم‌های تصمیم، تأیید، رد، واگذاری، کنترل SLA، تشدید خودکار و Workflow Builder با نمودار React Flow.'
  },
  {
    icon: 'receipt',
    title: 'کنترل مالی و مالیاتی بومی ایران',
    desc: 'محاسبه ارزش افزوده، گزارش فصلی ماده ۱۶۹، ارسال به سامانه مؤدیان، تطبیق صورتحساب‌ها و لاگ ممیزی.'
  },
  {
    icon: 'shield-check',
    title: 'امنیت سازمانی چندلایه',
    desc: 'مدیریت نقش و مجوز، ABAC، ایزولاسیون داده، تفکیک وظایف (SoD)، ماسک فیلدهای حساس، MFA و لاگ حسابرسی.'
  },
  {
    icon: 'smartphone',
    title: 'تجربه کاربری فارسی و واکنش‌گرا',
    desc: 'راست‌چین ۱۰۰٪، فونت وزیرمتن، تب‌های پویا، جدول‌های حرفه‌ای، جست‌وجوی سریع و تعاملات AJAX بدون رفرش.'
  },
  {
    icon: 'plug-2',
    title: 'آماده اتصال به اکوسیستم سازمان',
    desc: 'REST API نسخه‌گذاری‌شده v1، وب‌هوک‌های دوطرفه، صف RabbitMQ/Outbox، اتصال مستقیم به دیتابیس و گزارش‌ساز هوشمند.'
  }
];

/* ========================================================
   2. DATA: 15 FULL DETAILED MODULES
   ======================================================== */
const modulesData = [
  {
    id: '3.1',
    name: 'داشبورد مرکزی و مدیریت سازمان',
    icon: 'layout-dashboard',
    summary: 'صفحه خانه، داشبورد مدیریت و نماهای تحلیلی برای نمایش KPI، کارهای معوق، سررسید فاکتورها، وضعیت فرآیندها و سلامت اتصال‌ها.',
    value: 'مدیر به‌جای جمع‌آوری دستی اطلاعات، تصویر واحدی از وضعیت عملیات، ریسک‌ها، سررسیدها و عملکرد سازمان دریافت می‌کند.',
    features: [
      'صفحه خانه و داشبورد عملیاتی با کارت‌های خلاصه، اقدامات سریع و کارهای در انتظار.',
      'داشبورد مدیریت: نمای کلی، وضعیت اتصال‌ها، ذخیره و حذف اتصال بانک اطلاعاتی، آزمون اتصال.',
      'ساخت گزارش از متن کاربر با AI، خواندن اسکیمای SQL Server، تولید پلن SQL محدود و نمایش داده‌های دو ستونه.',
      'داشبوردهای اختصاصی مالی، قرارداد، انبار، حسابرسی، فاکتور و منابع انسانی.',
      'داشبورد تحلیل فرآیند با نمودار داده و خروجی Excel.'
    ],
    endpoints: [
      'Home/Index (Operational Dashboard)',
      'Management/Dashboard (KPI & Overview)',
      'Management/Connections/Save',
      'Management/Connections/Delete',
      'Management/Connections/Test',
      'AI SQL Report Generator / Schema Introspection',
      'Dashboards: Finance / Contract / Inventory / HR',
      'Process Analytics / Excel Export'
    ]
  },
  {
    id: '3.2',
    name: 'منابع انسانی و سرمایه انسانی',
    icon: 'users',
    summary: 'پرونده جامع کارکنان و چرخه عمر استخدام، وضعیت شغلی، حقوق، قرارداد منابع انسانی، مرخصی، وام، حضور و غیاب و بیمه.',
    value: 'کاهش خطای منابع انسانی، نگهداری تاریخچه قابل استناد کارکنان و کوتاه‌کردن زمان پردازش حقوق، بیمه و مرخصی.',
    features: [
      'فهرست کارکنان با فیلتر، جست‌وجوی سریع، ایجاد، ویرایش، جزئیات، حذف و خروجی Excel.',
      'پرونده پرسنلی شامل کد پرسنلی، کد ملی، تاریخ تولد، تاریخ استخدام، دپارتمان، سمت و وضعیت.',
      'کنترل یکتایی کد پرسنلی و کد ملی و اعتبارسنجی ترتیب تاریخ‌های تولد، استخدام و پایان قرارداد.',
      'تاریخ‌های شمسی/میلادی با نرمال‌سازی و تبدیل تاریخ جلالی.',
      'تاریخچه حقوق و ثبت افزایش حقوق؛ تاریخچه تغییر وضعیت و تایم‌لاین پرونده.',
      'قرارداد کارکنان: فهرست، ایجاد و اتصال به شخص و وضعیت استخدامی.',
      'مرخصی کارکنان: ثبت، فهرست، جزئیات، ویرایش، حذف، تأیید و رد با گردش‌کار.',
      'وام کارکنان: ثبت، فهرست و مدیریت اطلاعات وام.',
      'حضور و غیاب: ثبت رویداد، فهرست و جزئیات داده‌های حضور.',
      'گزارش‌های منابع انسانی و خروجی اطلاعات کارکنان.',
      'بیمه: فهرست بیمه ماهانه، ایجاد، ویرایش، جزئیات، حذف، ثبت AJAX، کپی از ماه قبل، انتخاب کارکنان، وضعیت‌ها و پردازش تاریخ شمسی.',
      'کارفرماها: فهرست، جست‌وجو، ایجاد، ویرایش و حذف.',
      'دپارتمان‌ها: فهرست و ایجاد.'
    ],
    endpoints: [
      'HumanCapital/Index, Create, Edit, Details',
      'HumanCapital/Contracts, CreateContract',
      'HumanCapital/Leaves, CreateLeave',
      'HumanCapital/Loans, CreateLoan',
      'HumanCapital/Attendance, CreateAttendance',
      'HumanCapital/Reports, ExportExcel, SearchEmployees',
      'Bimeh/Index, SaveInsuranceAjax, CopyFromPreviousMonth',
      'Bimeh/GetEmployees, GetEmployeeById',
      'REST API: /api/v1/employees',
      'REST API: /api/v1/leaves & create leave'
    ]
  },
  {
    id: '3.3',
    name: 'حقوق و دستمزد',
    icon: 'wallet-cards',
    summary: 'ایجاد لیست حقوق، محاسبه، کنترل کیفیت، ذخیره، جزئیات، چاپ فیش و خروجی گروهی.',
    value: 'استانداردسازی محاسبه حقوق، کاهش خطای ورود دستی و ایجاد سند پرداخت قابل چاپ و گزارش‌گیری.',
    features: [
      'فهرست حقوق بر اساس ماه، سال و کارمند؛ ایجاد لیست دوره‌ای.',
      'ویرایش و مشاهده جزئیات لیست و اقلام حقوق.',
      'محاسبه حقوق از طریق درخواست JSON، نمایش هشدارهای کیفیت و خلاصه تغییرات.',
      'ذخیره نتیجه محاسبه و کنترل دسترسی مالی.',
      'جست‌وجوی کارکنان و دریافت کارمند با شناسه.',
      'خروجی Excel لیست حقوق، خروجی گروهی فیش‌ها و مسیرهای PDF پیش‌بینی‌شده.',
      'چاپ فیش حقوقی و اتصال به خروجی‌های مالی.'
    ],
    endpoints: [
      'Payroll/Index (ماهانه و سالانه)',
      'Payroll/Create & Edit',
      'Payroll/Details',
      'Payroll/Calculate (JSON Action & Quality Warnings)',
      'Payroll/Save & Access Control',
      'Payroll/SearchEmployees, GetEmployeeById',
      'Payroll/ExportExcel',
      'Payroll/BulkPayslips & Print Payslip (PDF)'
    ]
  },
  {
    id: '3.4',
    name: 'حسابداری، خزانه و مالی',
    icon: 'landmark',
    summary: 'هسته مالی شامل فاکتور، حساب‌ها، اسناد حسابداری، دفتر، تراز آزمایشی، دوره مالی، ارز و بستن حساب‌ها.',
    value: 'ایجاد دفتر مالی منسجم، کنترل چرخه عمر سند، تسریع گزارش‌دهی و آماده‌سازی داده برای حسابرسی و اظهارنامه.',
    features: [
      'فهرست فاکتورهای فروش و خرید با فیلتر و کنترل شماره فاکتور.',
      'ایجاد، ویرایش، تأیید، رد و حذف فاکتور با مجوزهای مجزا.',
      'داشبورد مالی و داشبورد ارزش افزوده؛ گزارش فصلی مالیات و هاب گزارش‌گیری.',
      'درخت و فهرست تخت حساب‌ها، ایجاد حساب گروه، کل، معین و تفصیلی، ویرایش و کنترل کد تکراری.',
      'مشاهده گردش حساب تفصیلی، جست‌وجوی حساب‌های معین و اطلاعات شناور.',
      'دفتر کل با بازه زمانی، دفتر عملیات و تراز آزمایشی بر اساس دوره مالی.',
      'ایجاد نرخ ارز و دریافت آخرین نرخ ارز برای تاریخ مشخص.',
      'ایجاد سند ساده، شماره‌گذاری مجدد اسناد، ثبت/ارسال سند، کپی سند با امکان جابه‌جایی بدهکار و بستانکار.',
      'تغییر وضعیت سند، برگشت سند با علت و تاریخ، ابطال سند با علت.',
      'بستن حساب‌های موقت و مدیریت وضعیت دوره مالی.',
      'دفترهای تکرارشونده و الگوهای ثبت؛ قالب‌های تخصیص و ثبت خودکار تخصیص‌ها.',
      'خروجی Excel فاکتورها، انبار و حقوق.',
      'چاپ PDF فاکتور، رسید انبار و فیش حقوقی.'
    ],
    endpoints: [
      'GET /api/v1/finance/vouchers',
      'GET /api/v1/finance/vouchers/{id}',
      'POST /api/v1/finance/vouchers',
      'GET /api/v1/finance/balance-report',
      'GET/POST/PUT /api/v1/chart-of-accounts (Tree/List/Edit)',
      'ChartOfAccounts/Turnover & ValidateCode',
      'GeneralLedger/Index & TrialBalance',
      'CurrencyRates/Index & GetLatestRate',
      'Vouchers/Renumber, Copy, Reverse, Cancel'
    ]
  },
  {
    id: '3.5',
    name: 'مالیات و سامانه مؤدیان',
    icon: 'receipt-text',
    summary: 'محاسبه مالیات، تحلیل روند، هشدار هوشمند، ممیزی و ارسال امن صورتحساب به سامانه مؤدیان.',
    value: 'کاهش مغایرت مالیاتی، حذف ورود مجدد اطلاعات، پیگیری قابل مشاهده ارسال‌ها و افزایش آمادگی برای ممیزی.',
    features: [
      'محاسبه مالیات در سطح فاکتور و خطوط کالا با تفکیک پایه و مالیات.',
      'داشبورد تحلیل مالیاتی، بینش‌ها، روند مبالغ دوره‌ای و هشدارهای ناهنجاری/ریسک.',
      'دستیار پرسش‌وپاسخ مالیاتی با زبان طبیعی و داده‌های ساختاریافته.',
      'جست‌وجوی لاگ ممیزی مالیاتی بر اساس عمل و عبارت جست‌وجو.',
      'صف ارسال، ارسال دسته‌ای، تلاش مجدد موارد ناموفق و خلاصه وضعیت.',
      'تطبیق فاکتور با پاسخ سامانه و نمایش مغایرت‌ها.',
      'ساخت خروجی پرتال، ورود به پرتال، OTP، CAPTCHA OCR، پیگیری پیشرفت کار و دانلود خروجی.',
      'رمزنگاری/امضای payload، کلاینت واقعی و sandbox سامانه مؤدیان.',
      'تنظیمات اتصال و پارامترهای مؤدیان.',
      'API همگام‌سازی فاکتورها و ارسال‌ها و endpoint تأیید دریافت برای ERP.'
    ],
    endpoints: [
      'TaxAnalytics/Insights, Ask, Alerts',
      'TaxAudit/Search',
      'Mowadiyan/BatchSend, RetryFailed',
      'Mowadiyan/RunReconciliation',
      'Mowadiyan/CreatePortalExport, InitiatePortalLogin',
      'Mowadiyan/ExportProgress, SaveSettings',
      'IntegrationWebhook/GetInvoicesForSync',
      'IntegrationWebhook/GetSubmissionsForSync',
      'IntegrationWebhook/Acknowledge'
    ]
  },
  {
    id: '3.6',
    name: 'ورود هوشمند فاکتور و اتوماسیون دریافت',
    icon: 'scan-line',
    summary: 'دریافت فایل و پوشه، استخراج متن و فیلدهای فاکتور، اعتبارسنجی JSON و تبدیل آن به رکورد قابل استفاده در مالیات و حسابداری.',
    value: 'تبدیل اسناد پراکنده و تصویرمحور به داده ساختاریافته، سریع و قابل حسابرسی با حداقل ورود دستی.',
    features: [
      'بارگذاری چند فایل در صفحه ورود فاکتور، مشاهده فهرست جلسات و وضعیت هر فایل.',
      'پردازش هر سند با OCR، استخراج شماره، تاریخ، فروشنده، خریدار، اقلام، مبالغ و مالیات.',
      'ویرایش متادیتا پیش از پردازش و حذف ورودی.',
      'اعتبارسنجی ساختار JSON با مسیر خطا و پیام دقیق.',
      'تشخیص موجودیت و رفع ابهام معنایی خطوط فاکتور.',
      'نرمال‌سازی ارز، تاریخ جلالی و طبقه‌بندی اقلام مالیاتی.',
      'دریافت فایل ZIP و پردازش خودکار آرشیو.',
      'وب‌هوک فایل، Base64، ZIP و پیام Telegram؛ پشتیبانی از metadata اختیاری.',
      'نگهداری جلسه در حافظه یا دیتابیس و کنترل مالک جلسه.'
    ],
    endpoints: [
      'InvoiceIntake/Index & Multi-File Upload',
      'InvoiceIntake/Sessions & Status',
      'OCR Process / Entity Recognition / JSON Validation',
      'Normalization: Jalali Date & Currency',
      'ZIP Archive Auto-Processing',
      'Webhook Intake: File, Base64, ZIP, Telegram',
      'Session Persistence & Owner Verification'
    ]
  },
  {
    id: '3.7',
    name: 'مدیریت قرارداد و تعهدات',
    icon: 'file-signature',
    summary: 'چرخه کامل قرارداد از ایجاد و نسخه‌بندی تا پرداخت، تعهد، امضا، ضمانت، جریمه، آرشیو و تحلیل ارزش.',
    value: 'جلوگیری از فراموشی سررسید و تعهد، شفاف‌سازی جریان نقدی قرارداد و حفظ سابقه حقوقی تمام نسخه‌ها و امضاها.',
    features: [
      'فهرست قراردادها با فیلتر، داشبورد و صفحه جزئیات.',
      'ایجاد و ویرایش قرارداد با فیلدهای قابل تنظیم، اعتبارسنجی و تاریخچه تغییرات.',
      'آرشیو، بازگردانی از آرشیو، حذف و اقدامات گروهی.',
      'مدیریت طرفین، نوع قرارداد، وضعیت چرخه عمر و تمدید خودکار؛ لغو تمدید خودکار و ثبت لاگ.',
      'تقویم تعهدات و گزارش‌های سن قرارداد/سررسید، درآمد، قیف ارزش، تقویم و مواجهه مالی.',
      'برنامه پرداخت: تولید اقساط، حذف برنامه، ثبت و حذف پرداخت و وضعیت پرداخت.',
      'محاسبه جریمه تأخیر، تعریف قاعده جریمه، تغییر وضعیت جریمه و انواع جریمه.',
      'ضمانت‌نامه: افزودن، ویرایش، آزادسازی، حذف و انواع ضمانت.',
      'الزامات اسنادی: نمایش چک‌لیست، بررسی تکمیل و ایجاد الزامات پیش‌فرض.',
      'پیوست‌ها: آپلود، دانلود، حذف، پیش‌نمایش، نسخه‌بندی، شرح تغییر، دانلود نسخه، بازگردانی نسخه و پاک‌سازی orphan.',
      'تولید سند از قالب، پیش‌نمایش خام/پردازش‌شده، مدیریت قالب، حذف و تعیین قالب پیش‌فرض.',
      'امضای داخلی، ایجاد درخواست امضا، تولید لینک امضای خارجی و فهرست درخواست‌های امضا.',
      'گزارش‌ها و خروجی Excel/PDF در سطح قرارداد و گزارش.',
      'ذخیره ترجیحات ستون و نماهای شخصی.'
    ],
    endpoints: [
      'Contracts/Index, Dashboard, Details, Create, Edit, Archive',
      'Contracts/Reports: Aging, Revenue, Pipeline, Calendar, Exposure',
      'Contracts/Schedule, GenerateSchedule, AddPayment',
      'Contracts/UploadAttachment, GenerateDocument, Settings',
      'Contracts/SignContract, CreateSignatureRequest',
      'Controllers: Guarantees, Penalties, Requirements',
      'Attachment Versioning / Orphan Cleanup',
      'BulkAction, ExportContracts, ExportReport'
    ]
  },
  {
    id: '3.8',
    name: 'بازرگانی، فروش و خرید',
    icon: 'shopping-cart',
    summary: 'مدیریت صورتحساب‌های فروش/خرید، برگشت، پیش‌فاکتور، طرف حساب، تسویه و پیوست تجاری.',
    value: 'کنترل چرخه سفارش تا تسویه و اتصال مستقیم عملیات فروش و خرید به حسابداری و مالیات.',
    features: [
      'فهرست فروش و خرید با جست‌وجو، سال، طرف حساب، وضعیت و وضعیت پرداخت.',
      'جزئیات فاکتور، ثبت/ارسال فاکتور و لغو با علت.',
      'برگشت فروش و خرید، دریافت خطوط فاکتور، ثبت برگشت و نهایی‌سازی برگشت.',
      'پیش‌فاکتورهای فروش/خرید، ایجاد، ویرایش محتوای خطوط، ذخیره و تبدیل به فاکتور.',
      'مدیریت طرفین تجاری: فهرست، ایجاد، ویرایش و فعال/غیرفعال بودن.',
      'ثبت تسویه فاکتور.',
      'آپلود، دانلود و حذف پیوست فاکتور.'
    ],
    endpoints: [
      'Commercial/Sales/Index & Details',
      'Commercial/Purchases/Index & Details',
      'Commercial/Submit, CancelWithReason',
      'Commercial/Returns/GetLines, Register, Finalize',
      'Commercial/Proforma/Create, EditLines, ConvertToInvoice',
      'Commercial/Parties/Index, Create, Edit, ToggleActive',
      'Commercial/Settlement/Register',
      'Commercial/Attachments/Upload, Download, Delete'
    ]
  },
  {
    id: '3.9',
    name: 'انبار و موجودی',
    icon: 'warehouse',
    summary: 'مدیریت کالا، انبارها، رسید، حواله، انتقال، موجودی، شمارش و بستن دوره انبار.',
    value: 'جلوگیری از کسری و مازاد، کنترل گردش کالا و ایجاد زنجیره تأییدپذیر از دریافت تا مصرف یا انتقال.',
    features: [
      'داشبورد انبار با موجودی، کالاهای کم‌موجودی، اسناد اخیر، انتقال‌های در انتظار، انبارهای پرریسک و روند گردش.',
      'کالاها: فهرست و جست‌وجو، ایجاد، ویرایش، حذف، فعال/غیرفعال و کنترل کد یکتا.',
      'انبارها: فهرست، ایجاد، ویرایش، کنترل کد و تعیین مدیر.',
      'رسید انبار: ایجاد با اقلام، جزئیات، تأیید، رد، لغو و بازگشایی.',
      'حواله خروج: ایجاد با اقلام، جزئیات، تأیید، رد، لغو و بازگشایی.',
      'درخواست انتقال بین انبارها: ایجاد، فهرست با فیلتر مبدأ/مقصد/کالا/درخواست‌کننده، جزئیات، تأیید، رد با علت و لغو با علت.',
      'موجودی و دفتر گردش موجودی؛ نمایش Snapshot و روند حرکت.',
      'شمارش موجودی: ایجاد، فهرست، جزئیات، تأیید و ثبت مغایرت.',
      'پیش‌نمایش و اجرای بستن دوره انبار با اقلام کنترل.',
      'خروجی Excel موجودی و چاپ PDF رسید.',
      'ثبت رویداد حسابرسی عملیات انبار.'
    ],
    endpoints: [
      'Inventory/Dashboard (LowStock, PendingTransfers, Risks)',
      'Inventory/Products/Index, Create, Edit, Delete',
      'Inventory/Warehouses/Index, Create, Edit, AssignManager',
      'Inventory/Receipts/Create, Details, Approve, Reject, Cancel, Reopen',
      'Inventory/Issues/Create, Details, Approve, Reject, Cancel, Reopen',
      'Inventory/Transfers/Create, Filter, Approve, RejectWithReason',
      'Inventory/StockSnapshot & Ledger',
      'Inventory/StockCount/Create, Verify, RegisterDiscrepancy',
      'Inventory/PeriodClose/Preview & Execute',
      'Inventory/ExportExcel & PrintReceiptPDF'
    ]
  },
  {
    id: '3.10',
    name: 'اتوماسیون اداری، مکاتبات و آرشیو اسناد',
    icon: 'folder-lock',
    summary: 'مدیریت نامه‌ها، پاسخ‌ها، پیوست‌ها، یادداشت‌ها و آرشیو امن اسناد سازمانی.',
    value: 'کاهش زمان یافتن سند، جلوگیری از گردش نسخه‌های قدیمی و حفظ محرمانگی نامه‌ها و مستندات.',
    features: [
      'نامه‌ها: فهرست، ایجاد، ویرایش، جزئیات، حذف و تأیید.',
      'پاسخ به نامه و ارتباط نامه اصلی/پاسخ، گیرنده و رونوشت.',
      'پیوست و یادداشت نامه.',
      'دستیار AI برای پیش‌نویس، خلاصه‌سازی و تولید پاسخ.',
      'آرشیو اسناد با جست‌وجو، دسته‌بندی و سطح دسترسی.',
      'بارگذاری، پیش‌نمایش، دانلود و حذف سند.',
      'تاریخچه نسخه‌ها، آپلود نسخه جدید، بازگردانی نسخه و دانلود نسخه مشخص.',
      'خروجی Excel و PDF آرشیو.',
      'API اسناد برای فهرست، بارگذاری و دانلود.'
    ],
    endpoints: [
      'Letters/Index, Create, Edit, Details, Delete, Approve',
      'Letters/Reply, LinkToOriginal, Recipients, CC',
      'Letters/Attachments & Notes',
      'Letters/AIAssistant: Draft, Summarize, GenerateReply',
      'DocumentArchive/Index, Categories, AccessLevels',
      'DocumentArchive/Upload, Preview, Download, Delete',
      'DocumentArchive/VersionHistory, UploadNewVersion, RevertVersion',
      'REST API: /api/v1/documents (List, Upload, Download)',
      'Archive/ExportExcel & ExportPDF'
    ]
  },
  {
    id: '3.11',
    name: 'کارتابل و گردش‌کار سازمانی',
    icon: 'inbox',
    summary: 'یک نقطه واحد برای مشاهده و پردازش وظایف تأیید، تصمیم‌گیری، واگذاری و ردیابی کار.',
    value: 'حذف گلوگاه‌های تأیید، قابل اندازه‌گیری‌کردن زمان انجام کار و حفظ مسئولیت‌پذیری هر مرحله.',
    features: [
      'کارتابل با فیلتر و فهرست وظایف در انتظار.',
      'پردازش وظیفه با action، تأیید/رد سند و ثبت تصمیم و نظر.',
      'عملیات گروهی روی وظایف.',
      'افزودن نظر معمولی یا نظر همراه با mention و اتصال به گام گردش‌کار.',
      'واگذاری وظیفه به کاربر دیگر با یادداشت.',
      'دانلود پیوست گردش‌کار.',
      'نمای Kanban و تغییر وضعیت کارت.',
      'ثبت زمان صرف‌شده و شرح فعالیت و مشاهده لاگ زمان.',
      'SLA، زمان‌بندی، تشدید خودکار و اعلان وظایف نزدیک به سررسید.',
      'API کارتابل برای دریافت، تأیید و رد وظیفه.',
      'هاب SignalR برای تعاملات بلادرنگ و اعلان تغییرات.'
    ],
    endpoints: [
      'Inbox/Index (Filter & Pending Tasks)',
      'Inbox/ProcessTask (Action, Approve, Reject, Comment)',
      'Inbox/BulkActions (تأیید یا رد گروهی)',
      'Inbox/AddCommentWithMention',
      'Inbox/DelegateTask (واگذاری به کاربر دیگر)',
      'Inbox/KanbanView & MoveCardStatus',
      'Inbox/TimeLog/Register & ViewLogs',
      'Workflow/SLAEngine & AutoEscalation',
      'REST API: /api/v1/workflow/tasks (Get, Approve, Reject)',
      'SignalR Hub: /hubs/workflowHub (Realtime Notification)'
    ]
  },
  {
    id: '3.12',
    name: 'امنیت، هویت و مدیریت دسترسی',
    icon: 'shield-check',
    summary: 'هویت، نقش، مجوز، سیاست دسترسی و طراحی مسیرهای تأیید با کنترل‌های امنیتی سازمانی.',
    value: 'اصل حداقل دسترسی، جداسازی مسئولیت‌ها و امکان اثبات اینکه چه کسی، چه زمانی و چه تغییری انجام داده است.',
    features: [
      'ورود، خروج و دریافت مشخصات کاربر جاری از API احراز هویت.',
      'کاربران: فهرست و ایجاد با اتصال کارمند، مدیر و نقش.',
      'نقش‌ها: ایجاد، حذف، تغییر نام، فهرست و مدیریت مجوزها.',
      'ماتریس نقش/مجوز، فهرست کاتالوگ مجوز و پروفایل دسترسی کاربر جاری.',
      'مجوزهای تفکیک‌شده برای مشاهده، ایجاد، ویرایش، حذف، تأیید، خروجی و تنظیمات هر ماژول.',
      'ABAC، کنترل Query، ایزولاسیون داده و ماسک‌کردن فیلدهای حساس.',
      'تفکیک وظایف و قواعد تعارض نقش.',
      'مدیریت مسیر گردش‌کار و approverها.',
      'Workflow Builder گرافیکی با دریافت/ذخیره graph و node/edgeهای React Flow.',
      'تغییر رمز عبور، فعال‌سازی و غیرفعال‌سازی ورود دومرحله‌ای، کد تأیید و recovery codes.',
      'ثبت کامل رویدادهای حسابرسی و خروجی عادی و SIEM.',
      'هدرهای امنیتی، ضدجعل فرم، API Key و مدیریت خطای API.'
    ],
    endpoints: [
      'Auth/Login, Logout, GetCurrentUser',
      'Users/Index, Create, AssignRoles & Managers',
      'Roles/Index, Create, Delete, Rename, ManagePermissions',
      'Permissions/MatrixCatalog & UserProfile',
      'WorkflowBuilder/GetGraph, SaveGraph (React Flow Node/Edge)',
      'Security/ChangePassword, EnableMFA, VerifyTOTP, RecoveryCodes',
      'Audit/SearchLogs, ExportSIEMLogs',
      'Middleware: AntiForgery, SecurityHeaders, ApiKeyHandler'
    ]
  },
  {
    id: '3.13',
    name: 'اعلان‌ها و تقویم سازمانی',
    icon: 'bell-ring',
    summary: 'مرکز اعلان‌ها و تقویم تجمیعی برای مرخصی، سررسید فاکتور، حقوق و رویدادهای دستی.',
    value: 'تبدیل سررسید و هشدار از اطلاعات پنهان به اقدام به‌موقع و قابل مشاهده.',
    features: [
      'فهرست اعلان با فیلتر شدت، ماژول و وضعیت خوانده‌شدن.',
      'شمارش خوانده‌نشده، خواندن یک اعلان و خواندن همه.',
      'دریافت JSON اعلان‌ها برای ویجت‌های زنده.',
      'تنظیم اشتراک هشدارها به تفکیک ماژول و بروزرسانی اشتراک.',
      'تقویم ماهانه/سالانه و افزودن رویداد دستی.',
      'تولید رویداد خودکار از مرخصی‌ها، موعد فاکتورها و حقوق.'
    ],
    endpoints: [
      'Notifications/Index (Severity, Module, ReadStatus)',
      'Notifications/UnreadCount',
      'Notifications/MarkAsRead & MarkAllAsRead',
      'Notifications/GetJsonFeed (Live Widgets)',
      'Notifications/Subscriptions & UpdateSettings',
      'Calendar/MonthlyView & YearlyView',
      'Calendar/AddManualEvent',
      'Calendar/AutoEvents (Leaves, InvoiceDue, Payroll)'
    ]
  },
  {
    id: '3.14',
    name: 'گزارش‌ساز، جست‌وجوی سراسری و نماهای شخصی',
    icon: 'search-code',
    summary: 'دسترسی سریع به داده‌ها و ساخت گزارش/نمای مناسب هر کاربر.',
    value: 'کوتاه‌کردن مسیر رسیدن به داده و شخصی‌سازی میزکار بدون توسعه سفارشی برای هر کاربر.',
    features: [
      'جست‌وجوی کامل و جست‌وجوی سریع در نامه‌ها، کارکنان، فاکتورها، کالاها، فروشندگان، بارنامه‌ها و کاربران.',
      'مرکز گزارش‌ها با کارت خلاصه، بخش، preset و اقدام گزارش.',
      'خروجی Excel نامه، بارنامه، محصول، فروشنده، افراد، کاربران و بیمه.',
      'نماهای ذخیره‌شده، ذخیره/حذف نما و layout ستون‌ها و فیلترها.',
      'ترجیحات جدول و ستون، انتخاب ستون و فیلترهای ماندگار.',
      'گزارش هوشمند مدیریتی با کنترل امنیت SQL و خروجی داده‌های محدود.'
    ],
    endpoints: [
      'GlobalSearch/Query (Letters, Employees, Invoices, Goods, Vendors)',
      'ReportsCenter/Index & Presets',
      'Reports/ExportExcel (Letters, Waybills, Products, Vendors, People, Users, Insurance)',
      'SavedViews/SaveView, DeleteView, ApplyLayout',
      'TablePreferences/SaveColumns, PersistFilters',
      'AISecureReport/ExecuteLimitedPlan'
    ]
  },
  {
    id: '3.15',
    name: 'بارنامه، طرف حساب و داده‌های پایه',
    icon: 'database',
    summary: 'نگهداری داده‌های پایه و اسناد حمل در کنار مشتری، فروشنده و کارفرما.',
    value: 'حذف داده‌های تکراری و ایجاد مرجع واحد برای اشخاص، کالاها، حمل و معاملات.',
    features: [
      'بارنامه: فهرست و فیلتر، ایجاد، جزئیات، ویرایش، حذف و اتصال به گردش‌کار.',
      'فروشندگان: فهرست، جست‌وجو، ایجاد، ویرایش و حذف.',
      'مشتریان و طرف‌های تجاری قابل استفاده در فاکتور و قرارداد.',
      'بارگذاری داده‌های گروهی با Bulk Import Service.'
    ],
    endpoints: [
      'Waybills/Index, Filter, Details',
      'Waybills/Create, Edit, Delete, AttachWorkflow',
      'Vendors/Index, Search, Create, Edit, Delete',
      'Customers/Index, Search, Create, Edit',
      'BusinessParties/Index (یکپارچه با فاکتور و قرارداد)',
      'BaseData/BulkImportService (Excel/CSV Batch Load)'
    ]
  }
];

/* ========================================================
   3. DATA: TECHNICAL ARCHITECTURE ITEMS
   ======================================================== */
const techItems = [
  {
    title: 'C# / ASP.NET Core MVC & Web API',
    desc: 'معماری چندلایه‌ای تمیز با تفکیک صریح لایه‌های Controller، ViewModel/DTO، Service، Domain و Infrastructure؛ طراحی ماژول‌های کاملاً مستقل برای Finance، Commercial، Inventory، Office، Workflow، Identity، Platform، Invoice Intake، OCR، Tax Engine و Mowadiyan Integration.'
  },
  {
    title: 'Entity Framework Core & SQL Server',
    desc: 'پیکربندی صریح Entityها، شاخص‌گذاری و بهینه‌سازی کوئری‌ها، و خطوط Migration کامپایل‌شده جداگانه برای هر کانتکست دیتابیس جهت استقرار بدون ریسک.'
  },
  {
    title: 'Multi-DbContext و چندمستاجری (Multi-Tenant)',
    desc: 'جداسازی کانتکست‌های PlatformDbContext، FinanceDbContext، WorkflowDbContext، InventoryDbContext، OfficeDbContext، IdentityDbContext و TaxDbContext همراه با Tenant Resolver هوشمند، Schema Isolation، Quota و کش‌سازی مجزا.'
  },
  {
    title: 'یکپارچه‌سازی و ارتباطات بلادرنگ',
    desc: 'ارائه REST API نسخه‌گذاری‌شده v1، درگاه وب‌هوک برای فایل و ERP، صف پیام‌رسانی RabbitMQ با مدیریت خطا و هاب SignalR برای به‌روزرسانی زنده کارتابل.'
  },
  {
    title: 'بومی‌سازی جامع و OCR فارسی',
    desc: 'پشتیبانی عمیق از تقویم جلالی، محاسبات مالیاتی ایران (ارزش افزوده و ماده ۱۶۹)، نرمال‌سازی کلمات و حروف فارسی و Tesseract OCR اختصاصی.'
  }
];

/* ========================================================
   4. DATA: UI/UX STRENGTHS
   ======================================================== */
const uxItems = [
  {
    icon: 'layout',
    title: 'رابط کاملاً راست‌چین و بومی',
    desc: 'فونت استاندارد Vazirmatn، پشتیبانی کامل از تاریخ شمسی جلالی و الگوهای فرم سازگار با کاربران اداری ایران.'
  },
  {
    icon: 'layout-grid',
    title: 'داشبوردهای ماژولار و ثابت',
    desc: 'کارت‌های آماری (Metric Cards)، نمودارهای روند، بج‌های وضعیت و اقدامات سریع با دسترسی یک کلیکی.'
  },
  {
    icon: 'table-2',
    title: 'جدول‌های حرفه‌ای با نماهای ذخیره‌شده',
    desc: 'جست‌وجوی سریع، فیلتر ترکیبی، مرتب‌سازی، انتخاب ستون‌های دلخواه، ذخیره نمای شخصی و خروجی اکسل/PDF.'
  },
  {
    icon: 'refresh-cw',
    title: 'تعاملات بدون رفرش کامل (AJAX)',
    desc: 'استفاده از اندپوینتهای JSON، باز شدن مودال‌ها، پیش‌نمایش زنده فایل و بروزرسانی بلادرنگ از طریق SignalR.'
  },
  {
    icon: 'git-fork',
    title: 'طراح گردش‌کار و کانبان',
    desc: 'Workflow Builder گرافیکی مبتنی بر React Flow برای ترسیم فرایندهای تأیید و نمای Kanban برای ردیابی وظایف.'
  },
  {
    icon: 'check-square',
    title: 'فرم‌های پیشرفته با اعتبارسنجی',
    desc: 'امنیت Anti-Forgery، نمایش خطاها با دقت بالا در فیلد، مدیریت Focus، اسکلتون لودر و لودرهای بصری پیشرفت.'
  },
  {
    icon: 'printer',
    title: 'الگوهای چاپ استاندارد',
    desc: 'تمپلیت‌های اختصاصی برای چاپ رسمی فاکتورها، فیش حقوقی کارکنان، رسیدهای انبار و نامه‌های اداری.'
  },
  {
    icon: 'sparkles',
    title: 'طراحی شیک Glassmorphism',
    desc: 'پالت رنگی سرمه‌ای تیره، سایه‌های شیشه‌ای و کنتراست فوق‌العاده مدرن بدون وابستگی به Bootstrap یا jQuery قدیمی.'
  },
  {
    icon: 'monitor-smartphone',
    title: 'پاسخ‌گویی کامل (Responsive)',
    desc: 'سازگاری ۱۰۰٪ با انواع مانیتورهای عریض، لپ‌تاپ، تبلت و موبایل با منوی واکنش‌گرا و سلسله‌مراتب بصری تمیز.'
  }
];

/* ========================================================
   5. DATA: COMPLETE 55+ FEATURE MATRIX TABLE
   ======================================================== */
const matrixData = [
  ["داشبورد مدیریتی و KPI", "مدیریت", "مدیر", "گزارش"],
  ["گزارش AI از SQL Server", "مدیریت", "مدیر", "ابزار"],
  ["پرونده کارکنان", "منابع انسانی", "مدیر/کارمند منابع انسانی", "ابزار"],
  ["قراردادهای پرسنلی", "منابع انسانی", "مدیر/کارمند منابع انسانی", "گردش‌کار"],
  ["مرخصی و تأیید مرخصی", "منابع انسانی", "مدیر/کارمند", "گردش‌کار"],
  ["وام و حضور و غیاب", "منابع انسانی", "مدیر/کارمند منابع انسانی", "ابزار"],
  ["بیمه ماهانه", "منابع انسانی", "مدیر/کارمند مالی", "ابزار"],
  ["محاسبه و ذخیره حقوق", "حقوق و دستمزد", "مدیر مالی/منابع انسانی", "ابزار"],
  ["چاپ فیش حقوقی", "حقوق و دستمزد", "مدیر/کارمند", "گزارش"],
  ["فاکتور فروش و خرید", "مالی", "مدیر مالی", "ابزار"],
  ["تأیید/رد فاکتور", "مالی", "مدیر مالی", "گردش‌کار"],
  ["درخت حساب‌ها", "حسابداری", "حسابدار", "ابزار"],
  ["سند حسابداری و دفتر کل", "حسابداری", "حسابدار", "ابزار"],
  ["تراز آزمایشی", "حسابداری", "حسابدار/مدیر", "گزارش"],
  ["بستن دوره مالی", "حسابداری", "مدیر مالی", "گردش‌کار"],
  ["نرخ ارز", "حسابداری", "حسابدار", "ابزار"],
  ["ارزش افزوده و گزارش فصلی", "مالیات", "مدیر مالی", "گزارش"],
  ["تحلیل و هشدار مالیاتی", "مالیات", "مدیر مالی/ممیز", "گزارش"],
  ["ارسال به سامانه مؤدیان", "مالیات", "مدیر مالی", "گردش‌کار"],
  ["تطبیق صورتحساب مالیاتی", "مالیات", "ممیز/مدیر مالی", "گزارش"],
  ["OCR فاکتور", "ورود هوشمند", "کارمند مالی", "ابزار"],
  ["پردازش ZIP و وب‌هوک", "ورود هوشمند", "مدیر سیستم/مالی", "ابزار"],
  ["پیش‌فاکتور", "بازرگانی", "فروشنده/مدیر فروش", "ابزار"],
  ["برگشت فروش و خرید", "بازرگانی", "فروشنده/خریدار", "گردش‌کار"],
  ["تسویه فاکتور", "بازرگانی", "حسابدار", "ابزار"],
  ["قراردادهای سازمان", "قرارداد", "مدیر قرارداد", "ابزار"],
  ["برنامه اقساط و پرداخت", "قرارداد", "مدیر قرارداد/مالی", "ابزار"],
  ["ضمانت‌نامه", "قرارداد", "مدیر قرارداد", "ابزار"],
  ["جریمه تأخیر", "قرارداد", "مدیر قرارداد/مالی", "ابزار"],
  ["امضای دیجیتال قرارداد", "قرارداد", "مدیر/امضاکننده", "گردش‌کار"],
  ["نسخه‌بندی پیوست", "قرارداد/آرشیو", "مدیر/کارمند", "ابزار"],
  ["گزارش درآمد و مواجهه قرارداد", "قرارداد", "مدیر", "گزارش"],
  ["کالا و انبار", "انبار", "مدیر انبار", "ابزار"],
  ["رسید و حواله انبار", "انبار", "انباردار", "گردش‌کار"],
  ["انتقال بین انبارها", "انبار", "انباردار/مدیر", "گردش‌کار"],
  ["شمارش موجودی", "انبار", "انباردار/ناظر", "گردش‌کار"],
  ["بستن دوره انبار", "انبار", "مدیر انبار", "گردش‌کار"],
  ["نامه و مکاتبات", "اتوماسیون اداری", "کارمند/مدیر", "ابزار"],
  ["پیش‌نویس، خلاصه و پاسخ AI", "مکاتبات", "کارمند/مدیر", "ابزار"],
  ["آرشیو اسناد", "مدیریت اسناد", "عمومی مجاز", "ابزار"],
  ["کارتابل تأیید", "گردش‌کار", "مدیر/کارمند", "گردش‌کار"],
  ["واگذاری و SLA", "گردش‌کار", "مدیر/کارمند", "گردش‌کار"],
  ["Kanban وظایف", "کارتابل", "مدیر/کارمند", "ابزار"],
  ["نقش و مجوز", "امنیت", "مدیر سیستم", "ابزار"],
  ["MFA و تغییر رمز", "امنیت", "عمومی", "ابزار"],
  ["ماتریس دسترسی", "امنیت", "مدیر سیستم", "گزارش"],
  ["Workflow Builder", "امنیت/گردش‌کار", "مدیر سیستم", "ابزار"],
  ["اعلان و اشتراک هشدار", "اعلان‌ها", "عمومی", "ابزار"],
  ["تقویم سازمانی", "تقویم", "مدیر/کارمند", "گزارش"],
  ["جست‌وجوی سراسری", "پلتفرم", "عمومی مجاز", "ابزار"],
  ["نماها و فیلترهای ذخیره‌شده", "پلتفرم", "عمومی مجاز", "ابزار"],
  ["خروجی‌های Excel/PDF", "گزارش‌ها", "مدیر/کاربر مجاز", "گزارش"],
  ["API و وب‌هوک ERP", "یکپارچه‌سازی", "مدیر سیستم", "ابزار"],
  ["حسابرسی و خروجی SIEM", "امنیت/حسابرسی", "ممیز/مدیر", "گزارش"]
];

/* ========================================================
   6. DATA: 7 FAQ ACCORDION ITEMS
   ======================================================== */
const faqData = [
  {
    q: "آیا راینو برای سازمان چندشعبه‌ای یا چندشرکتی مناسب است؟",
    a: "بله. طراحی چندمستاجری، resolver اتصال tenant، ایزولاسیون schema/داده و تنظیمات اختصاصی هر tenant امکان استقرار تفکیک‌شده برای شرکت‌ها، شعب و واحدهای سازمانی را فراهم می‌کند."
  },
  {
    q: "اطلاعات مالی و اسناد تا چه اندازه امن هستند؟",
    a: "دسترسی‌ها بر اساس نقش، مجوز، سیاست‌های ABAC و scope داده کنترل می‌شوند. علاوه بر MFA و هدرهای امنیتی، عملیات در Audit Log ثبت می‌شود، فیلدهای حساس قابلیت masking دارند و جداسازی وظایف از تعارض دسترسی جلوگیری می‌کند."
  },
  {
    q: "استقرار راینو چگونه انجام می‌شود؟",
    a: "سامانه بر بستر ASP.NET Core و SQL Server اجرا می‌شود و با Migrationهای EF Core، Docker و تنظیمات محیطی قابل استقرار در سرور داخلی یا زیرساخت ابری سازمان است. اتصال‌ها، برندینگ، کاربران، نقش‌ها و تنظیمات هر سازمان در پنل مدیریت پیکربندی می‌شوند."
  },
  {
    q: "آیا فاکتورهای کاغذی یا PDF قابل ورود خودکار هستند؟",
    a: "بله. ماژول ورود هوشمند فایل، OCR فارسی، استخراج فیلد، تشخیص موجودیت، نرمال‌سازی ارز و تاریخ، اعتبارسنجی ساختار و ویرایش پیش از ثبت را ارائه می‌کند؛ دریافت ZIP، وب‌هوک، Base64 و Telegram نیز پشتیبانی شده است."
  },
  {
    q: "راینو چگونه ارسال و پیگیری مالیات را مدیریت می‌کند؟",
    a: "صورتحساب‌ها پس از محاسبه و اعتبارسنجی در صف ارسال قرار می‌گیرند، ارسال دسته‌ای و retry دارند، پاسخ سامانه مؤدیان ذخیره می‌شود و تطبیق، مغایرت، لاگ ممیزی، CAPTCHA/OTP، sandbox و گزارش پیشرفت در اختیار تیم مالی قرار می‌گیرد."
  },
  {
    q: "آیا گردش‌کارها قابل سفارشی‌سازی هستند؟",
    a: "بله. مدیر سیستم می‌تواند مسیرها و approverها را تعریف کند یا نمودار گردش‌کار را در Workflow Builder بسازد. تأیید، رد، واگذاری، نظر، mention، SLA و تشدید خودکار برای فرآیندها در نظر گرفته شده است."
  },
  {
    q: "کاربران می‌توانند گزارش و میزکار خود را شخصی‌سازی کنند؟",
    a: "بله. جست‌وجوی سراسری، فیلترها، انتخاب ستون، نماهای ذخیره‌شده، ترجیحات جدول، داشبوردهای ماژولار و گزارش‌ساز متنی AI، تجربه هر کاربر را متناسب با مسئولیت او تنظیم می‌کند."
  }
];

/* ========================================================
   RENDER LOGIC
   ======================================================== */
let currentActiveModuleIndex = 0;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&', '<': '<', '>': '>', '"': '"', "'": '',
  }[m]));
}

// 1. Render Highlights
function renderHighlights() {
  const container = document.getElementById('highlightsContainer');
  if (!container) return;
  container.innerHTML = highlightsData.map((item, idx) => `
    <div class="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
      <div>
        <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
          <i data-lucide="${item.icon}" class="w-6 h-6"></i>
        </div>
        <h3 class="text-base font-bold text-white mb-2">${idx + 1}. ${escapeHtml(item.title)}</h3>
        <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(item.desc)}</p>
      </div>
    </div>
  `).join('');
}

// 2. Render Module Sidebar Tabs
function renderModuleSidebar() {
  const sidebar = document.getElementById('moduleSidebar');
  if (!sidebar) return;
  sidebar.innerHTML = modulesData.map((m, idx) => `
    <button 
      onclick="selectModule(${idx})" 
      id="mod-tab-${idx}"
      class="w-full text-right px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border border-transparent transition-all duration-200 ${idx === 0 ? 'tab-active' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'}"
    >
      <div class="flex items-center gap-2.5 truncate">
        <i data-lucide="${m.icon}" class="w-4 h-4 text-cyan-400 shrink-0"></i>
        <span class="truncate">${m.id} ${escapeHtml(m.name)}</span>
      </div>
      <i data-lucide="chevron-left" class="w-3.5 h-3.5 text-slate-500 shrink-0"></i>
    </button>
  `).join('');
}

// 3. Render Active Module Details
function renderModuleDetail(idx) {
  const m = modulesData[idx];
  const area = document.getElementById('moduleContentArea');
  if (!area || !m) return;

  // Update sidebar active class
  modulesData.forEach((_, i) => {
    const btn = document.getElementById(`mod-tab-${i}`);
    if (btn) {
      if (i === idx) {
        btn.className = "w-full text-right px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border border-transparent transition-all duration-200 tab-active";
      } else {
        btn.className = "w-full text-right px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border border-transparent transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60";
      }
    }
  });

  area.innerHTML = `
    <div class="animate-module-content space-y-7">
      
      <!-- Top Bar: Title & Value Card -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-5 border-b border-slate-800 pb-6">
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
            ماژول ${m.id}
          </div>
          <h3 class="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <i data-lucide="${m.icon}" class="w-7 h-7 text-cyan-400"></i>
            <span>${escapeHtml(m.name)}</span>
          </h3>
          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-light">
            ${escapeHtml(m.summary)}
          </p>
        </div>

        <!-- Value delivered box -->
        <div class="md:w-72 shrink-0 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-1.5 shadow-lg">
          <div class="flex items-center gap-1.5 font-bold text-emerald-400">
            <i data-lucide="trending-up" class="w-4 h-4"></i>
            <span>کاربرد و ارزش تجاری:</span>
          </div>
          <p class="text-[11px] leading-relaxed text-emerald-200/90">${escapeHtml(m.value)}</p>
        </div>
      </div>

      <!-- Body: 2 Columns (Features List & Endpoints List) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        <!-- Features Column (7 cols) -->
        <div class="md:col-span-7 space-y-3">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="check-circle" class="w-4 h-4 text-cyan-400"></i>
            <span>تمام ریز-امکانات ماژول (${m.features.length} مورد تفکیک‌شده):</span>
          </h4>
          <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            ${m.features.map(f => `
              <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed hover:border-slate-700 transition-colors">
                <span class="text-cyan-400 font-black mt-0.5">•</span>
                <span>${escapeHtml(f)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Technical Endpoints Column (5 cols) -->
        <div class="md:col-span-5 space-y-3">
          <h4 class="text-sm font-bold text-white flex items-center gap-2">
            <i data-lucide="terminal" class="w-4 h-4 text-emerald-400"></i>
            <span>مسیرها و اندپوینتهای شاخص:</span>
          </h4>
          <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            ${m.endpoints.map(ep => `
              <div class="p-2 rounded-lg bg-slate-950/90 border border-slate-800/80 font-mono text-[11px] text-cyan-300/90 dir-ltr text-left overflow-x-auto">
                ${escapeHtml(ep)}
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Bottom CTA Action within Module -->
      <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-400">
        <span>نیاز به استقرار اختصاصی ماژول <strong>${escapeHtml(m.name)}</strong> دارید؟</span>
        <button onclick="openDemoModal()" class="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold transition-all flex items-center gap-1.5">
          <span>درخواست جلسه دمو برای این ماژول</span>
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        </button>
      </div>

    </div>
  `;
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function selectModule(idx) {
  currentActiveModuleIndex = idx;
  renderModuleDetail(idx);
}

// 4. Render Tech Stack
function renderTechStack() {
  const container = document.getElementById('techStackContainer');
  if (!container) return;
  container.innerHTML = techItems.map((item, idx) => `
    <div class="glass-card glass-card-hover rounded-2xl p-5 border border-slate-800 space-y-1.5">
      <div class="flex items-center gap-2 text-cyan-400 text-sm font-bold">
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span>${escapeHtml(item.title)}</span>
      </div>
      <p class="text-xs text-slate-300 leading-relaxed font-light">${escapeHtml(item.desc)}</p>
    </div>
  `).join('');
}

// 5. Render UI/UX Strengths
function renderUXCards() {
  const container = document.getElementById('uxCardsContainer');
  if (!container) return;
  container.innerHTML = uxItems.map((item) => `
    <div class="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 space-y-3">
      <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
        <i data-lucide="${item.icon}" class="w-5 h-5"></i>
      </div>
      <h3 class="text-sm font-bold text-white">${escapeHtml(item.title)}</h3>
      <p class="text-xs text-slate-400 leading-relaxed font-light">${escapeHtml(item.desc)}</p>
    </div>
  `).join('');
}

// 6. Live Filter Matrix Table
function renderMatrixTable() {
  const tbody = document.getElementById('matrixTableBody');
  const countEl = document.getElementById('matrixResultsCount');
  const resetBtn = document.getElementById('resetMatrixFilter');
  if (!tbody || !countEl || !resetBtn) return;

  const q = document.getElementById('matrixSearch').value.trim().toLowerCase();
  const userRole = document.getElementById('userRoleFilter').value;
  const kind = document.getElementById('featureKindFilter').value;

  if (q || userRole || kind) {
    resetBtn.classList.remove('hidden');
  } else {
    resetBtn.classList.add('hidden');
  }

  const filtered = matrixData.filter(row => {
    const [featureName, moduleName, userCategory, featureKind] = row;
    const matchesQuery = !q || 
      featureName.toLowerCase().includes(q) || 
      moduleName.toLowerCase().includes(q) || 
      userCategory.toLowerCase().includes(q) || 
      featureKind.toLowerCase().includes(q);

    const matchesRole = !userRole || userCategory.includes(userRole);
    const matchesKind = !kind || featureKind === kind;

    return matchesQuery && matchesRole && matchesKind;
  });

  countEl.textContent = `نمایش ${filtered.length} مورد از ${matrixData.length} امکان مستندشده سیستم راینو`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="py-12 text-center text-slate-400 text-sm">
          هیچ امکانی با عبارت «${escapeHtml(q)}» یا فیلترهای انتخابی یافت نشد.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr class="hover:bg-slate-900/60 transition-colors">
      <td class="py-3.5 px-5 font-bold text-white">${escapeHtml(r[0])}</td>
      <td class="py-3.5 px-5 text-cyan-300 font-medium">
        <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-xs">
          ${escapeHtml(r[1])}
        </span>
      </td>
      <td class="py-3.5 px-5 text-slate-300">${escapeHtml(r[2])}</td>
      <td class="py-3.5 px-5">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
          r[3] === 'گردش‌کار' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
          r[3] === 'گزارش' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
          'bg-blue-500/15 text-blue-400 border border-blue-500/30'
        }">
          ${escapeHtml(r[3])}
        </span>
      </td>
    </tr>
  `).join('');
}

// 7. Render FAQ Accordion
function renderFAQ() {
  const container = document.getElementById('faqAccordionContainer');
  if (!container) return;
  container.innerHTML = faqData.map((item, idx) => `
    <div class="glass-card rounded-2xl border border-slate-800 overflow-hidden transition-all duration-200">
      <button 
        onclick="toggleFaq(${idx})" 
        class="w-full text-right p-5 sm:p-6 text-sm sm:text-base font-bold text-white flex items-center justify-between gap-4 hover:text-cyan-300 transition-colors"
      >
        <span>${idx + 1}. ${escapeHtml(item.q)}</span>
        <i data-lucide="chevron-down" id="faq-chevron-${idx}" class="w-5 h-5 text-cyan-400 shrink-0 transition-transform duration-300"></i>
      </button>
      <div id="faq-answer-${idx}" class="hidden px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4 font-light">
        ${escapeHtml(item.a)}
      </div>
    </div>
  `).join('');
}

function toggleFaq(idx) {
  const ans = document.getElementById(`faq-answer-${idx}`);
  const chev = document.getElementById(`faq-chevron-${idx}`);
  if (!ans || !chev) return;
  if (ans.classList.contains('hidden')) {
    ans.classList.remove('hidden');
    chev.style.transform = 'rotate(180deg)';
  } else {
    ans.classList.add('hidden');
    chev.style.transform = 'rotate(0deg)';
  }
}

// 8. Modal Management
function openDemoModal() {
  const modal = document.getElementById('demoModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function closeDemoModal() {
  const modal = document.getElementById('demoModal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function handleDemoSubmit(e) {
  e.preventDefault();
  const alert = document.getElementById('demoSuccessAlert');
  if (!alert) return;
  alert.classList.remove('hidden');
  setTimeout(() => {
    e.target.reset();
    setTimeout(() => {
      alert.classList.add('hidden');
      closeDemoModal();
    }, 2000);
  }, 500);
}

// ========================================================
// SCROLL REVEAL - Intersection Observer
// ========================================================
function initScrollReveal() {
  const sections = document.querySelectorAll('.section-reveal');
  if (sections.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  sections.forEach((section) => {
    observer.observe(section);
  });
}

// ========================================================
// PROGRESS BAR - Reading progress indicator
// ========================================================
function initProgressBar() {
  const bar = document.createElement('div');
  bar.id = 'readingProgress';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 9999;
    height: 2px; background: linear-gradient(90deg, #38bdf8, #06b6d4, #10b981);
    width: 0%; transition: width 0.1s ease-out;
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
  `;
  document.body.prepend(bar);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + '%';
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ========================================================
// INITIALIZATION
// ========================================================
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Render all sections
  renderHighlights();
  renderModuleSidebar();
  renderModuleDetail(0);
  renderTechStack();
  renderUXCards();
  renderMatrixTable();
  renderFAQ();

  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Reset Matrix Filters
  const resetBtn = document.getElementById('resetMatrixFilter');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      document.getElementById('matrixSearch').value = '';
      document.getElementById('userRoleFilter').value = '';
      document.getElementById('featureKindFilter').value = '';
      renderMatrixTable();
    });
  }

  // Close modal on background click
  const modal = document.getElementById('demoModal');
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeDemoModal();
      }
    });
  }

  // Setup listeners for live matrix filtering
  const matrixSearch = document.getElementById('matrixSearch');
  const userRoleFilter = document.getElementById('userRoleFilter');
  const featureKindFilter = document.getElementById('featureKindFilter');
  if (matrixSearch) matrixSearch.addEventListener('input', renderMatrixTable);
  if (userRoleFilter) userRoleFilter.addEventListener('change', renderMatrixTable);
  if (featureKindFilter) featureKindFilter.addEventListener('change', renderMatrixTable);

  // Init scroll reveal animations for sections
  initScrollReveal();

  // Init reading progress bar
  initProgressBar();
});