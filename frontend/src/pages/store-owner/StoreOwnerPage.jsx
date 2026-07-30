import React, { useState, useEffect, useRef } from "react";
import { App, Card, Row, Col, Button, Typography, Tag, Tabs, Modal, Empty, Input, InputNumber, Select, Form, Divider, Upload, Progress, DatePicker } from "antd";
import { EnvironmentOutlined, PhoneOutlined, TagOutlined, ShopOutlined, ClockCircleOutlined, EditOutlined, GiftOutlined, FireOutlined, CheckCircleOutlined, CrownOutlined, StarOutlined, SettingOutlined, LogoutOutlined, GlobalOutlined, PictureOutlined, UploadOutlined, UserOutlined, QrcodeOutlined, InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import localDb from "../../services/db/localDb";
import seedData from "../../services/db/seedData";
import {
  confirmRewardPickupRemote,
  getSStoreInventoryHistory,
  getSStoreMaterialInventoryHistory,
  getSStoreSellThroughHistory,
  getStoreById,
  submitSStoreInventory,
  submitSStoreMaterialInventory,
  submitSStoreSellThrough,
} from "../../services/api";
import { isLocal, setLocalMode, shouldAllowLocalDbFallback } from "../../services/api/helpers";
import useLanguageStore from "../../stores/languageStore";
import { DISPLAY_CATEGORIES, getDisplayCategoryLabel, readImageAsDataUrl } from "../../utils/uwellClosedLoop";
import { confirmRewardPickup, validateRewardPickup } from "../../utils/reward-redemption";
import { sLevelStorePolicy } from "../../utils/legal-content";
import { buildStoreActivityCampaign } from "../../utils/fanActivityRules";
import { OPERATIONAL_RULE_RECORD_ID, REGIONAL_WAREHOUSES, getFanLevel, mergeOperationalRules, resolveStoreActivityVerification } from "../../utils/uwellLaunchRules";

const { Title, Text } = Typography;

const formatStoreDateValue = (value) => value?.format?.("YYYY-MM-DD") || value;
const isLocalTrialHost = () => {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
};

const ensureTrialSStoreReportHistory = (activeStore) => {
  if (!activeStore || activeStore.id !== "s-real-012") return;

  [
    "s_store_sell_through",
    "s_store_product_inventory_snapshots",
    "s_store_material_inventory_snapshots",
  ].forEach((tableName) => {
    const hasStoreHistory = localDb.find(tableName, (record) => record.store_id === activeStore.id).length > 0;
    if (hasStoreHistory) return;

    const trialRows = (seedData[tableName] || []).filter((record) => record.store_id === activeStore.id);
    if (trialRows.length > 0) localDb.insertBatch(tableName, trialRows);
  });
};

const STORE_PHOTO_TYPES = [
  {
    key: "store_front_photo",
    label: "Store Front Photo",
    purpose: "Shown on fan map. Use a clear storefront or signboard.",
  },
  {
    key: "display_photos",
    label: "Display Photos",
    purpose: "Used for level review and display follow-up.",
  },
];

const sStoreReportExecutionItems = [
  "store_owner_weekly_sell_through",
  "store_owner_monthly_sell_through",
  "store_owner_product_stock_check",
  "store_owner_material_stock_check",
];

const sReportNumberInputProps = {
  min: 0,
  precision: 0,
  inputMode: "numeric",
  controls: false,
  className: "so-input-dark",
  style: { width: "100%" },
};

const STORE_OWNER_AR_COPY = {
  "Please upload an image file": "يرجى رفع ملف صورة.",
  "Submitted for admin review": "تم الإرسال لمراجعة الإدارة.",
  "Image could not be read. Please choose a smaller image": "تعذر قراءة الصورة. يرجى اختيار صورة أصغر.",
  "Please enter a redemption code": "يرجى إدخال رمز الاستبدال.",
  "Reward pickup confirmed": "تم تأكيد استلام المكافأة.",
  "Reward pickup failed": "فشل تأكيد استلام المكافأة.",
  "Activity submitted. It will appear in Fan Center after admin approval.": "تم إرسال الفعالية. ستظهر في مركز المعجبين بعد موافقة الإدارة.",
  "Store Level": "مستوى المتجر",
  "Next best action": "أفضل إجراء تالٍ",
  "Exposure this week": "الظهور هذا الأسبوع",
  "Today operating queue": "قائمة تشغيل اليوم",
  "Keep photos, verification, campaign results, and material stock clear for fan-facing exposure.": "حافظ على وضوح الصور والتحقق ونتائج الحملات ومخزون المواد لتعزيز الظهور أمام المعجبين.",
  "All core tasks are clear": "كل المهام الأساسية مكتملة",
  "New photo feedback, material requests, activity reviews, or verification work will appear here.": "ستظهر هنا ملاحظات الصور وطلبات المواد ومراجعات الفعاليات أو أعمال التحقق الجديدة.",
  "Track UWELL review feedback for your events, material requests, and store photos.": "تابع ملاحظات مراجعة UWELL لفعالياتك وطلبات المواد وصور المتجر.",
  "No pending store feedback": "لا توجد ملاحظات معلقة للمتجر",
  "Submitted events, material requests, and rejected photos will appear here.": "ستظهر هنا الفعاليات المرسلة وطلبات المواد والصور المرفوضة.",
  "Clear": "واضح",
  "Materials, gifts, or costs may need to be handled by the store": "قد يتحمل المتجر المواد أو الهدايا أو التكاليف",
  "Official campaigns": "الحملات الرسمية",
  "View details, apply, wait for materials, run activity.": "اعرض التفاصيل، قدّم الطلب، انتظر المواد، ثم نفّذ الفعالية.",
  "Store-created events": "فعاليات المتجر",
  "Edit content, time, and result. Send to UWELL review.": "عدّل المحتوى والوقت والنتيجة. أرسلها لمراجعة UWELL.",
  "My material requests": "طلبات المواد الخاصة بي",
  "Store Front Photo": "صورة واجهة المتجر",
  "Display Photos": "صور العرض",
  "Shown on fan map. Use a clear storefront or signboard.": "تظهر على خريطة المعجبين. استخدم واجهة أو لوحة واضحة.",
  "Used for level review and display follow-up.": "تُستخدم لمراجعة المستوى ومتابعة العرض.",
  "Store Front Photo & Display Photos": "صورة واجهة المتجر وصور العرض",
  "Upload": "رفع",
  "Reupload": "إعادة الرفع",
  "Submitted and locked": "تم الإرسال والقفل",
  "Verify actions": "إجراءات التحقق",
  "Fan participation": "مشاركة المعجب",
  "Scan fan identity QR to verify participation.": "امسح رمز هوية المعجب للتحقق من المشاركة.",
  "Manual fallback": "إدخال يدوي",
  "Enter Fan ID or email when QR is unavailable.": "أدخل معرف المعجب أو البريد الإلكتروني عند عدم توفر رمز QR.",
  "Reward redemption": "استبدال المكافأة",
  "Check redemption code before handing over reward.": "تحقق من رمز الاستبدال قبل تسليم المكافأة.",
  "Scan fan member QR": "مسح رمز عضوية المعجب",
  "Scan fan QR to confirm participation.": "امسح رمز QR الخاص بالمعجب لتأكيد المشاركة.",
  "Enter Fan ID or email": "أدخل معرف المعجب أو البريد الإلكتروني",
  "Use when camera, QR, or assisted check-in needs fallback.": "استخدمه عند تعطل الكاميرا أو الرمز أو الحاجة إلى مساعدة الموظف.",
  "Fan ID, email, or activity code": "معرف المعجب أو البريد الإلكتروني أو رمز الفعالية",
  "Pickup execution queue": "قائمة تنفيذ الاستلام",
  "Enter redemption code": "أدخل رمز الاستبدال",
  "This store cannot fulfill fan rewards until A/S approval.": "لا يمكن لهذا المتجر تسليم مكافآت المعجبين قبل اعتماد مستوى A/S.",
  "Pickup validation result": "نتيجة التحقق من الاستلام",
  "Confirm only when the validation state is eligible.": "أكد فقط عندما تكون حالة التحقق مؤهلة.",
  "Reward item": "عنصر المكافأة",
  "Redemption code": "رمز الاستبدال",
  "Record status": "حالة السجل",
  "Responsibilities": "المسؤوليات",
  "Store rewards and consequences": "مكافآت المتجر والتبعات",
  "Fan QR / Fan ID / email / activity code": "رمز المعجب / معرف المعجب / البريد الإلكتروني / رمز الفعالية",
  "Photos ready for review": "الصور جاهزة للمراجعة",
  "Manage photos": "إدارة الصور",
  "Keep in Me": "إبقاؤها في حسابي",
  "Upload photos": "رفع الصور",
  "Tell fans what happens in store": "أخبر المعجبين بما سيحدث في المتجر",
  "Fans will see this only after admin approval.": "لن يراه المعجبون إلا بعد موافقة الإدارة.",
  "S Featured Store": "متجر UWELL مميز S",
  "A Recommended Store": "متجر موصى به A",
  "B Partner Store": "متجر شريك B",
  "C Starter Store": "متجر بداية C",
  "Map address recorded": "تم تسجيل العنوان على الخريطة",
  "Address pending": "العنوان قيد الاستكمال",
  "Active": "نشط",
  "Claimed": "تم الانضمام",
  "Ended": "منتهية",
  "Draft": "مسودة",
  "Cancelled": "ملغاة",
  "To confirm": "بانتظار التأكيد",
  "Inactive": "غير نشط",
  "Pending review": "قيد المراجعة",
  "Needs more info": "تحتاج معلومات إضافية",
  "Needs update": "تحتاج تحديثاً",
  "Escalated": "مصعّدة",
  "Packed": "تم التجهيز",
  "Shipped": "تم الشحن",
  "Delivered": "تم التسليم",
  "Store-created event requires UWELL approval before fans can see it.": "فعالية المتجر تحتاج موافقة UWELL قبل أن تظهر للمعجبين.",
  "My event": "فعاليتي",
  "Material": "مادة",
  "Store material request": "طلب مواد للمتجر",
  "Shown to fans on map after approval.": "تظهر للمعجبين على الخريطة بعد الموافقة.",
  "Used for level review after approval.": "تُستخدم لمراجعة المستوى بعد الموافقة.",
  "Photo": "صورة",
  "Required": "مطلوب",
  "Complete store photos": "استكمال صور المتجر",
  "Upload Store Front Photo and Display Photos. Store Front Photo is shown to fans on the map.": "ارفع صورة واجهة المتجر وصور العرض. تظهر صورة الواجهة للمعجبين على الخريطة.",
  "missing": "ناقصة",
  "Daily": "يومي",
  "Verify fan visits": "تحقق من زيارات المعجبين",
  "Scan member QR or enter Fan ID after an in-store activity. Store users verify only; system rules award points.": "امسح رمز العضوية أو أدخل معرف المعجب بعد فعالية داخل المتجر. المتجر يتحقق فقط، وقواعد النظام تمنح النقاط.",
  "Open Verify": "فتح التحقق",
  "verified": "تم التحقق",
  "Review": "مراجعة",
  "Submit campaign results": "إرسال نتائج الحملة",
  "Finish UWELL campaign feedback so operations can review material usage and activity effect.": "أكمل ملاحظات حملة UWELL حتى يراجع فريق العمليات استخدام المواد وأثر الفعالية.",
  "Submit result": "إرسال النتيجة",
  "pending": "قيد الانتظار",
  "Stock": "المخزون",
  "is near safety stock in your regional warehouse flow.": "قريب من حد مخزون الأمان في مسار مستودعك الإقليمي.",
  "low": "منخفض",
  "Event": "فعالية",
  "Check store event review": "تحقق من مراجعة فعالية المتجر",
  "UWELL must approve store-created events before they appear in Fan Activities > Store Events.": "يجب أن توافق UWELL على فعاليات المتجر قبل ظهورها في فعاليات المعجبين > فعاليات المتجر.",
  "View events": "عرض الفعاليات",
  "events": "فعاليات",
  "Setup readiness": "جاهزية الإعداد",
  "Ready": "جاهز",
  "Store photos and profile evidence support fan trust, map exposure, and level review.": "صور المتجر وأدلة الملف تدعم ثقة المعجبين والظهور على الخريطة ومراجعة المستوى.",
  "Fan verification": "تحقق المعجبين",
  "records": "سجلات",
  "Verify fan participation after store events. The system awards points after validation.": "تحقق من مشاركة المعجبين بعد فعاليات المتجر. يمنح النظام النقاط بعد التحقق.",
  "Campaign execution": "تنفيذ الحملات",
  "active": "نشطة",
  "Join official campaigns, submit results, and track store-created event review status.": "انضم إلى الحملات الرسمية، أرسل النتائج، وتابع حالة مراجعة فعاليات المتجر.",
  "locked": "مقفلة",
  "Submit sell-through, product stock, and material stock for backend S Store follow-up.": "أرسل معدل البيع الفعلي ومخزون المنتجات والمواد لمتابعة متجر S في الإدارة.",
  "Eligible": "مؤهل",
  "Locked": "مقفل",
  "Check redemption code, confirm eligible pickup, and keep fan/store records closed.": "تحقق من رمز الاستبدال، أكد أهلية الاستلام، وأغلق سجلات المعجب والمتجر.",
  "Photo readiness": "جاهزية الصور",
  "Ready for review": "جاهز للمراجعة",
  "Storefront and display evidence can support fan trust and level review.": "أدلة الواجهة والعرض تدعم ثقة المعجبين ومراجعة المستوى.",
  "Upload storefront and display photos so fans can recognize the store and UWELL can review display quality.": "ارفع صور الواجهة والعرض حتى يتعرف المعجبون على المتجر وتراجع UWELL جودة العرض.",
  "Fan service readiness": "جاهزية خدمة المعجبين",
  "No fan visits yet": "لا توجد زيارات معجبين بعد",
  "Recent fan participation is recorded for exposure and activity proof.": "تم تسجيل مشاركة المعجبين الأخيرة لدعم الظهور وإثبات الفعالية.",
  "Start with member QR verification after a fan joins an in-store activity.": "ابدأ بالتحقق من رمز العضوية بعد مشاركة المعجب في فعالية داخل المتجر.",
  "Start with member QR verification": "ابدأ بالتحقق من رمز العضوية",
  "Activity readiness": "جاهزية الفعاليات",
  "store events": "فعاليات متجر",
  "No store events yet": "لا توجد فعاليات متجر بعد",
  "Track UWELL review status before fan-side publishing.": "تابع حالة مراجعة UWELL قبل النشر للمعجبين.",
  "Join official campaigns first, then create store events when you need local activity support.": "انضم إلى الحملات الرسمية أولاً، ثم أنشئ فعاليات متجر عند الحاجة لدعم محلي.",
  "Join official campaigns first": "انضم إلى الحملات الرسمية أولاً",
  "Material readiness": "جاهزية المواد",
  "requests": "طلبات",
  "No material requests yet": "لا توجد طلبات مواد بعد",
  "Some materials are under the safety threshold. Request support before campaigns start.": "بعض المواد أقل من حد الأمان. اطلب الدعم قبل بدء الحملات.",
  "Request from your regional warehouse when campaigns, display upgrades, or stock risk need support.": "اطلب من مستودعك الإقليمي عند الحاجة لدعم الحملات أو تطوير العرض أو مخاطر المخزون.",
  "Request from your regional warehouse": "اطلب من مستودعك الإقليمي",
  "Keep verification, campaigns, photos, and materials current": "حافظ على التحقق والحملات والصور والمواد محدثة",
  "ready": "جاهز",
  "Fan map exposure": "ظهور خريطة المعجبين",
  "Priority": "أولوية",
  "Basic listing": "إدراج أساسي",
  "Home recommendation eligibility": "أهلية التوصية في الرئيسية",
  "Featured": "مميز",
  "Recommended": "موصى به",
  "Upgrade needed": "يحتاج ترقية",
  "Reward pickup permission": "صلاحية استلام المكافآت",
  "Available": "متاح",
  "Normal rewards: A/S stores. Premium rewards: S stores.": "المكافآت العادية: متاجر A/S. المكافآت المميزة: متاجر S.",
  "Normal rewards: A/S stores. Premium rewards need S-level approval.": "المكافآت العادية: متاجر A/S. المكافآت المميزة تحتاج اعتماد مستوى S.",
  "Reward pickup opens after A/S approval.": "يفتح استلام المكافآت بعد اعتماد A/S.",
  "Upgrade focus": "أولوية الترقية",
  "Photos first": "الصور أولاً",
  "Verify visits": "تحقق من الزيارات",
  "Join campaign": "انضم إلى حملة",
  "Fan traffic": "زيارات المعجبين",
  "Free campaign materials": "مواد حملات مجانية",
  "Official authorized store": "متجر معتمد رسمياً",
  "More exposure": "ظهور أكثر",
  "Active campaigns": "الحملات النشطة",
  "Pending claims": "مطالبات قيد التنفيذ",
  "Approved photos": "الصور المعتمدة",
  "Photos in review": "صور قيد المراجعة",
  "Views": "المشاهدات",
  "Navigation": "التوجيه",
  "Verified visits": "زيارات موثقة",
  "materials below safety stock": "مواد أقل من مخزون الأمان",
  "My store events": "فعاليات متجري",
  "UWELL review decides whether this appears in Fan Activities > Store Events.": "تقرر مراجعة UWELL ما إذا كانت ستظهر في فعاليات المعجبين > فعاليات المتجر.",
  "Cost responsibility acknowledged. UWELL support is not automatic.": "تم تأكيد مسؤولية التكلفة. دعم UWELL ليس تلقائياً.",
  "Please confirm cost responsibility before resubmission.": "يرجى تأكيد مسؤولية التكلفة قبل إعادة الإرسال.",
  "UWELL campaigns": "حملات UWELL",
  "Pending approval": "بانتظار الموافقة",
  "Request": "طلب",
  "Request materials": "طلب مواد",
  "Approved": "تمت الموافقة",
  "In review": "قيد المراجعة",
  "Missing": "ناقص",
  "Approved {count} / In review {pending}": "معتمد {count} / قيد المراجعة {pending}",
  "Rejected": "مرفوض",
  "No photos yet": "لا توجد صور بعد",
  "Period type": "نوع الفترة",
  "Weekly": "أسبوعي",
  "Monthly": "شهري",
  "Period start": "بداية الفترة",
  "Period end": "نهاية الفترة",
  "Open-system sold quantity": "كمية مبيعات الأجهزة المفتوحة",
  "Disposable sold quantity": "كمية مبيعات الأجهزة مرة واحدة",
  "Note": "ملاحظة",
  "Open-system current stock": "المخزون الحالي للأجهزة المفتوحة",
  "Open-system target stock": "المخزون المستهدف للأجهزة المفتوحة",
  "Disposable current stock": "المخزون الحالي للأجهزة مرة واحدة",
  "Disposable target stock": "المخزون المستهدف للأجهزة مرة واحدة",
  "Material type": "نوع المادة",
  "Current quantity": "الكمية الحالية",
  "Target quantity": "الكمية المستهدفة",
  "Open-system": "الأجهزة المفتوحة",
  "Disposable": "الأجهزة مرة واحدة",
  "Current": "الحالي",
  "Target": "المستهدف",
  "Low stock": "مخزون منخفض",
  "No sell-through records yet": "لا توجد سجلات معدل بيع بعد",
  "No product inventory records yet": "لا توجد سجلات مخزون منتجات بعد",
  "No material inventory records yet": "لا توجد سجلات مخزون مواد بعد",
  "Joined": "تم الانضمام",
  "Action needed": "إجراء مطلوب",
  "Verify fan visit": "تحقق من زيارة المعجب",
  "Submit campaign result": "إرسال نتيجة الحملة",
  "Check activity review": "تحقق من مراجعة الفعالية",
  "Submit first S Report": "إرسال أول تقرير S",
  "Upload store photos": "رفع صور المتجر",
  "Request low materials": "طلب المواد المنخفضة",
  "Pending verification": "بانتظار التحقق",
  "Verified": "تم التحقق",
  "Points added": "تمت إضافة النقاط",
  "Duplicate": "مكرر",
  "Normal: A/S stores. Premium: S stores. Diamond: backend-approved pickup only.": "العادية: متاجر A/S. المميزة: متاجر S. دايموند: استلام معتمد من الإدارة فقط.",
  "S-level responsibilities and incentives": "مسؤوليات وحوافز مستوى S",
  "Eligible for pickup": "مؤهل للاستلام",
  "Blocked before handover": "محظور قبل التسليم",
  "Reward pickup partners follow reward type rules: Normal rewards can be fulfilled by A/S stores, Premium rewards by S stores, and Diamond rewards only after backend approval and assigned pickup.": "شركاء استلام المكافآت يتبعون قواعد نوع المكافأة: العادية تُنفذ في متاجر A/S، والمميزة في متاجر S، ودايموند فقط بعد موافقة الإدارة وتحديد نقطة الاستلام.",
  "Scan support uses the same verification logic as manual fallback. Store users confirm participation only; the system awards points after validation.": "دعم المسح يستخدم نفس منطق التحقق كالإدخال اليدوي. مستخدمو المتجر يؤكدون المشاركة فقط؛ والنظام يمنح النقاط بعد التحقق.",
  "Phone pending": "الهاتف قيد الاستكمال",
  "Level": "المستوى",
  "photo tasks missing": "مهام صور ناقصة",
  "Material requests use this warehouse.": "طلبات المواد تستخدم هذا المستودع.",
  "Open store settings": "فتح إعدادات المتجر",
  "Product placement": "ترتيب المنتجات",
  "Material placement": "ترتيب مواد العرض",
  "Activity showcase": "صور الفعاليات",
  "Hot UWELL products": "منتجات UWELL الأكثر مبيعاً",
  "Regional warehouse": "المستودع الإقليمي",
  "Submit store event for review?": "إرسال فعالية المتجر للمراجعة؟",
  "View UWELL campaigns": "عرض حملات UWELL",
  "Activity submission failed": "فشل إرسال الفعالية",
  "Activity title": "عنوان الفعالية",
  "Please enter activity title": "يرجى إدخال عنوان الفعالية",
  "Activity content": "محتوى الفعالية",
  "Please enter activity content": "يرجى إدخال محتوى الفعالية",
  "Gift or benefit": "الهدية أو الميزة",
  "Please enter gift or benefit": "يرجى إدخال الهدية أو الميزة",
  "Start date": "تاريخ البداية",
  "Start date required": "تاريخ البداية مطلوب",
  "End date": "تاريخ النهاية",
  "End date required": "تاريخ النهاية مطلوب",
  "Optional fan points": "نقاط اختيارية للمعجبين",
  "Trial rule: 0 for gift-only events, or {min}-{max} points when requesting UWELL point support.": "قاعدة التجربة: 0 للفعاليات التي تعتمد على الهدايا فقط، أو {min}-{max} نقطة عند طلب دعم نقاط من UWELL.",
  "Point support must be 0 or {min}-{max}": "يجب أن يكون دعم النقاط 0 أو بين {min}-{max}",
  "S Store sell-through submitted.": "تم إرسال تقرير البيع الفعلي لمتجر S.",
  "S Store sell-through submission failed.": "فشل إرسال تقرير البيع الفعلي لمتجر S.",
  "S Store product inventory submitted.": "تم إرسال مخزون منتجات متجر S.",
  "S Store product inventory submission failed.": "فشل إرسال مخزون منتجات متجر S.",
  "S Store material inventory submitted.": "تم إرسال مخزون مواد متجر S.",
  "S Store material inventory submission failed.": "فشل إرسال مخزون مواد متجر S.",
  "{category} accepts up to 3 pending or approved images": "يمكن لفئة {category} قبول ما يصل إلى 3 صور قيد المراجعة أو معتمدة",
  "Participation verified. System awarded +{points} points.": "تم التحقق من المشاركة. منح النظام +{points} نقطة.",
  "Participation recorded. System sent it to review, no points awarded yet.": "تم تسجيل المشاركة. أرسلها النظام للمراجعة ولم تُمنح نقاط بعد.",
  "Requested {material}. Pending approval.": "تم طلب {material}. بانتظار الموافقة.",
  "Request failed.": "فشل الطلب.",
  "Submit for approval": "إرسال للموافقة",
  "Photo tasks": "مهام الصور",
};

const STORE_OWNER_AR_CAMPAIGN_COPY = {
  "G5 Launch Promotion": {
    name: "أسبوع إطلاق G5",
    description: "حملة إطلاق جهاز G5 الرائد للمتاجر من مستوى A. تشمل فعاليات تجربة وتدريب الموظفين ومواد عرض POSM لدعم صورة UWELL المتميزة.",
  },
  "Ramadan Vape Giveaway": {
    name: "نقاط رمضان المزدوجة",
    description: "عرض رمضان: اشترِ جهازي G4 واحصل على بود مجاناً. مسح رمز QR يمنح نقاطاً مضاعفة للمعجبين في متاجر A وB.",
  },
  "Store Display Upgrade Program": {
    name: "برنامج تطوير عرض المتاجر",
    description: "توفير صندوق إضاءة UWELL وحامل أكريليك لأفضل المتاجر لرفع ظهور الرفوف وحضور العلامة داخل المتجر.",
  },
};

// Level-based material bundles
const LEVEL_MATERIAL_BUNDLES = {
  S: { label: "S Featured Store", labelKey: "store_level_s_pack", Icon: CrownOutlined, materials: ["UWELL Door Panel", "UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Staff Vest", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#B9F2FF" },
  A: { label: "A Recommended Store", labelKey: "store_level_a_pack", Icon: CrownOutlined, materials: ["UWELL Lightbox", "UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#FFD700" },
  B: { label: "B Partner Store", labelKey: "store_level_b_pack", Icon: StarOutlined, materials: ["UWELL Acrylic Stand", "UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker", "UWELL Sample Pod"], color: "#C0C0C0" },
  C: { label: "C Starter Store", labelKey: "store_level_c_pack", Icon: TagOutlined, materials: ["UWELL Poster A2", "UWELL Product Catalog", "UWELL Sticker"], color: "#CD7F32" },
};

const campaignStatusLabel = (status) => {
  const labels = {
    ongoing: 'Active',
    completed: 'Ended',
    draft: 'Draft',
    cancelled: 'Cancelled',
  };
  return labels[status] || status || 'To confirm';
};

const storeStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    pending_review: 'Pending approval',
    inactive: 'Inactive',
    rejected: 'Rejected',
  };
  return labels[status] || 'Active';
};

const reviewStatusLabel = (status) => {
  const labels = {
    pending: "Pending review",
    pending_review: "Pending review",
    approved: "Approved",
    rejected: "Rejected",
    need_more_info: "Needs more info",
    needs_update: "Needs update",
    escalated: "Escalated",
    packed: "Packed",
    shipped: "Shipped",
    delivered: "Delivered",
  };
  return labels[status] || status || "Pending review";
};

const reviewStatusColor = (status) => {
  if (["approved", "delivered"].includes(status)) return "green";
  if (["rejected", "needs_update"].includes(status)) return "red";
  if (["need_more_info", "packed", "shipped"].includes(status)) return "orange";
  if (status === "escalated") return "volcano";
  return "gold";
};

const formatStoreLocation = (store) => {
  if (store?.city) return [store.city, store.country].filter(Boolean).join(', ');
  if (store?.address?.startsWith('http')) return 'Map address recorded';
  return store?.address || 'Address pending';
};

const normalizeRegion = (store = {}) => {
  const raw = String(store.region || store.city || store.address || "").toLowerCase();
  if (raw.includes("dammam")) return "Dammam";
  if (raw.includes("jeddah") || raw.includes("jedda")) return "Jeddah";
  return "Riyadh";
};

const getStoreWarehouse = (store = {}) => {
  const region = normalizeRegion(store);
  return REGIONAL_WAREHOUSES.find((item) => item.region === region)?.warehouse || `${region} Warehouse`;
};

const writeStoreAuditLog = ({ store, action, target, before = null, after = null, reason }) => {
  localDb.insert("audit_logs", {
    actor: store?.owner_name || store?.name || "Store owner",
    actor_id: store?.owner_profile_id || store?.id,
    role: "store_owner",
    region: normalizeRegion(store),
    action_type: action,
    action,
    target,
    target_id: target,
    before_value: before,
    after_value: after,
    reason,
    created_at: new Date().toISOString(),
  });
};

const normalizeFanVerificationCode = (code = "") => String(code)
  .trim()
  .replace(/^fan:/i, "")
  .replace(/^member:/i, "")
  .toLowerCase();

const findFanByVerificationCode = (code) => {
  const normalized = normalizeFanVerificationCode(code);
  return (localDb.all("fans") || []).find((fan) => [
    fan.id,
    fan.email,
    fan.phone,
    fan.member_code,
    fan.identity_code,
  ].filter(Boolean).some((value) => String(value).trim().toLowerCase() === normalized)) || null;
};

const awardStoreActivityPoints = ({ fan, store, campaign, points, verificationId }) => {
  if (!fan?.id || points <= 0) return fan;
  const nextAvailablePoints = Number(fan.points || fan.available_points || 0) + points;
  const nextLifetimeGrowth = Number(fan.total_contribution || fan.lifetime_growth_points || fan.growth_points || fan.points || 0) + points;
  const nextLevel = getFanLevel(nextLifetimeGrowth).level.toLowerCase();
  localDb.insert("fan_points_log", {
    fan_id: fan.id,
    points,
    type: "earn",
    source: "Store activity verification",
    description: `${store?.name || "UWELL store"} verified ${campaign?.name || "store activity"} +${points}`,
    campaign_id: campaign?.id || null,
    store_id: store?.id || null,
    verification_id: verificationId,
    created_at: new Date().toISOString(),
  });
  return localDb.update("fans", fan.id, {
    points: nextAvailablePoints,
    available_points: nextAvailablePoints,
    total_contribution: nextLifetimeGrowth,
    lifetime_growth_points: nextLifetimeGrowth,
    level: nextLevel,
  });
};

const StoreOwnerPage = () => {
  const navigate = useNavigate();
  const showcaseSectionRef = useRef(null);
  const activityActionSectionRef = useRef(null);
  const sReportFormSectionRef = useRef(null);
  const materialSectionRef = useRef(null);
  const [store, setStore] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [claimedCampaigns, setClaimedCampaigns] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, claim: null });
  const [reviewForm, setReviewForm] = useState({ materials_used: 0, effect: "good", feedback: "" });
  const [storeMaterials, setStoreMaterials] = useState([]);
  const [displayUploads, setDisplayUploads] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pickupCode, setPickupCode] = useState("");
  const [pickupResult, setPickupResult] = useState(null);
  const [activityVerifyCode, setActivityVerifyCode] = useState("");
  const [activityScannerOpen, setActivityScannerOpen] = useState(false);
  const [activityVerifyRecords, setActivityVerifyRecords] = useState([]);
  const [sLevelPolicyOpen, setSLevelPolicyOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [sStoreSellThroughHistory, setSStoreSellThroughHistory] = useState([]);
  const [sStoreProductInventoryHistory, setSStoreProductInventoryHistory] = useState([]);
  const [sStoreMaterialInventoryHistory, setSStoreMaterialInventoryHistory] = useState([]);
  const [editForm] = Form.useForm();
  const [activityForm] = Form.useForm();
  const [sSellThroughForm] = Form.useForm();
  const [sProductInventoryForm] = Form.useForm();
  const [sMaterialInventoryForm] = Form.useForm();
  const { message, modal } = App.useApp();
  const [materialRequesting, setMaterialRequesting] = useState(false);
  const { t, lang, setLang } = useLanguageStore();
  const st = (copy) => (lang === "ar" ? STORE_OWNER_AR_COPY[copy] || copy : copy);
  const getCampaignDisplayCopy = (campaign) => {
    if (lang !== "ar" || !campaign) return campaign || {};
    const localized = STORE_OWNER_AR_CAMPAIGN_COPY[campaign.name];
    if (!localized) return campaign;
    return {
      ...campaign,
      name: localized.name || campaign.name,
      description: localized.description || campaign.description,
    };
  };
  const getStoreDisplayCategoryLabel = (category) => {
    const labels = {
      product_placement: st("Product placement"),
      material_placement: st("Material placement"),
      activity_showcase: st("Activity showcase"),
      hot_products: st("Hot UWELL products"),
    };
    return labels[category] || getDisplayCategoryLabel(category);
  };
  const storeLanguageOptions = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ];
  const operationalRules = mergeOperationalRules(localDb.findById("fan_points_rules", OPERATIONAL_RULE_RECORD_ID)?.settings);

  // GSAP entrance animation

  // Load data
  useEffect(() => {
    let disposed = false;
    const loadStoreOwnerData = async () => {
    if (localStorage.getItem("store_owner_logged_in") !== "true") {
      navigate("/store-login", { replace: true });
      return;
    }

    setLocalMode(true);
    if (localDb.needsInit() || localDb.count("stores") === 0) localDb.init(seedData);

    const stores = localDb.all("stores") || [];
    const claims = localDb.all("campaign_claims") || [];
    const allMats = localDb.all("materials") || [];
    const savedStoreId = localStorage.getItem("store_owner_store_id");
    let activeStore = stores.find((item) => item.id === savedStoreId) || null;
    const canUseRemoteStoreLookup = savedStoreId && !activeStore && !isLocal() && !shouldAllowLocalDbFallback() && !isLocalTrialHost();
    if (canUseRemoteStoreLookup) {
      try {
        activeStore = await getStoreById(savedStoreId);
      } catch {
        activeStore = null;
      }
    }
    if (!activeStore) activeStore = stores[0];
    if (disposed) return;

    if (activeStore) {
      localStorage.setItem("store_owner_store_id", activeStore.id);
      setStore(activeStore);
    }

    const storeClaims = activeStore ? claims.filter((c) => c.store_id === activeStore.id) : [];

    setClaimedCampaigns(storeClaims);
    setAllCampaigns(localDb.all("campaigns") || []);
    setStoreMaterials(allMats);
    setDisplayUploads(activeStore ? localDb.find("store_display_uploads", (item) => item.store_id === activeStore.id) : []);
    setActivityVerifyRecords(activeStore ? localDb.find("store_activity_verifications", (item) => item.store_id === activeStore.id) : []);
    if (activeStore?.is_s_store || activeStore?.level === "S") {
      ensureTrialSStoreReportHistory(activeStore);
      const [sellThrough, productInventory, materialInventory] = await Promise.all([
        getSStoreSellThroughHistory(activeStore.id),
        getSStoreInventoryHistory(activeStore.id),
        getSStoreMaterialInventoryHistory(activeStore.id),
      ]);
      if (disposed) return;
      setSStoreSellThroughHistory(sellThrough);
      setSStoreProductInventoryHistory(productInventory);
      setSStoreMaterialInventoryHistory(materialInventory);
    } else {
      setSStoreSellThroughHistory([]);
      setSStoreProductInventoryHistory([]);
      setSStoreMaterialInventoryHistory([]);
    }

    };
    loadStoreOwnerData();
    return () => {
      disposed = true;
    };
  }, [navigate]);

  const hasPhotoType = (typeKey) => displayUploads.some((item) => item.category === typeKey && item.status !== "rejected");
  const missingRequiredStorePhotos = store ? STORE_PHOTO_TYPES.filter((item) => !hasPhotoType(item.key)) : [];

  const scrollToShowcaseSection = () => {
    showcaseSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const scrollToActivityActionSection = () => {
    activityActionSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const scrollToSReportFormSection = () => {
    sReportFormSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const scrollToMaterialSection = () => {
    materialSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleOpenEditStore = () => {
    if (store) {
      editForm.setFieldsValue({
        name: store.name,
        phone: store.phone,
        address: store.address,
        contact: store.contact,
      });
    }
    setEditModalOpen(true);
  };

  const handleStoreLogout = () => {
    localStorage.removeItem("store_owner_logged_in");
    localStorage.removeItem("store_owner_store_id");
    message.success(t("logout"));
    navigate("/store-login", { replace: true });
  };

  // Save store info
  const handleSaveStore = async () => {
    try {
      const values = await editForm.validateFields();
      const updated = { ...store, ...values, updated_at: new Date().toISOString() };
      localDb.update("stores", store.id, updated);
      setStore(updated);
      setEditModalOpen(false);
      message.success(t('store_update_success'));
    } catch (e) {
      message.error(t('save_failed') + ": " + e.message);
    }
  };

  // Claim campaign
  const handleClaim = (camp) => {
    if (claimedCampaigns.some((cx) => cx.campaign_id === camp.id)) {
      message.warning(t('already_claimed'));
      return;
    }
    const newClaim = {
      id: "cc-" + Date.now(),
      store_id: store.id,
      campaign_id: camp.id,
      campaign_name: camp.name,
      status: "pending",
      materials_used: 0,
      effect: "pending",
      feedback: "",
      claimed_at: new Date().toISOString(),
      reviewed_at: null,
    };
    localDb.insert("campaign_claims", newClaim);
    setClaimedCampaigns((prev) => [...prev, newClaim]);
    message.success(t('claim_success'));
  };

  // Submit review
  const handleSubmitReview = () => {
    if (!reviewModal.claim) return;
    const updated = {
      ...reviewModal.claim,
      ...reviewForm,
      status: "completed",
      reviewed_at: new Date().toISOString(),
    };
    localDb.update("campaign_claims", reviewModal.claim.id, updated);
    setClaimedCampaigns((prev) => prev.map((c) => (c.id === reviewModal.claim.id ? updated : c)));
    setReviewModal({ open: false, claim: null });
    message.success(t('review_submit_success'));
  };

  const refreshDisplayUploads = (storeId = store?.id) => {
    if (!storeId) return;
    setDisplayUploads(localDb.find("store_display_uploads", (item) => item.store_id === storeId));
  };

  const handleDisplayUpload = async (category, file) => {
    if (!store) return false;
    if (!file.type?.startsWith("image/")) {
      message.error(st("Please upload an image file"));
      return false;
    }

    const activeCount = localDb.find(
      "store_display_uploads",
      (item) => item.store_id === store.id && item.category === category && item.status !== "rejected"
    ).length;
    if (activeCount >= 3) {
        message.warning(st("{category} accepts up to 3 pending or approved images").replace("{category}", getStoreDisplayCategoryLabel(category)));
      return false;
    }

    try {
      const imageUrl = await readImageAsDataUrl(file);
      localDb.insert("store_display_uploads", {
        store_id: store.id,
        store_name: store.name,
        category,
        image_url: imageUrl,
        status: "pending",
        submitted_by: store.id,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        review_note: "",
      });
      refreshDisplayUploads(store.id);
      message.success(st("Submitted for admin review"));
    } catch {
      message.error(st("Image could not be read. Please choose a smaller image"));
    }
    return false;
  };

  if (!store) {
    return (
      <div className="so-spin-center">
        <Card className="so-card-main">
          <Title level={4} className="so-text-gold">{t('no_data')}</Title>
          <Text className="so-text-white50">{t('store_create')}</Text>
        </Card>
      </div>
    );
  }

  const isActiveSStoreAccount = Boolean(store?.is_s_store || store?.level === "S") && (store?.s_store_status || "active") === "active";
  const storeOwnerSStoreProfile = {
    id: store.owner_profile_id || store.store_owner_id || store.owner_user_id || store.id,
    role: "store_owner",
  };
  const levelBundle = LEVEL_MATERIAL_BUNDLES[store.level] || LEVEL_MATERIAL_BUNDLES.C;
  const levelBundleLabel = st(levelBundle.label || t(levelBundle.labelKey));
  const LevelIcon = levelBundle.Icon;
  const storeCampaignsForDashboard = allCampaigns.filter((campaign) => campaign.target_stores?.includes(store.id));
  const activeStoreCampaigns = storeCampaignsForDashboard.filter((campaign) => campaign.status === "ongoing");
  const pendingCampaignClaims = claimedCampaigns.filter((claim) => ["pending", "in_progress"].includes(claim.status));
  const displayApproved = displayUploads.filter((item) => item.status === "approved").length;
  const displayPending = displayUploads.filter((item) => item.status === "pending").length;
  const storeMaterialRequests = (localDb.all("material_requests") || [])
    .filter((item) => item.store_id === store.id)
    .sort((a, b) => new Date(b.created_at || b.requested_at || 0) - new Date(a.created_at || a.requested_at || 0));
  const myStoreEvents = allCampaigns
    .filter((campaign) => campaign.source === "store_application" && campaign.submitted_by_store_id === store.id)
    .sort((a, b) => new Date(b.submitted_at || b.created_at || 0) - new Date(a.submitted_at || a.created_at || 0));
  const stockRows = levelBundle.materials.map((name) => {
    const material = storeMaterials.find((item) => item.name === name);
    const stock = material ? localDb.find("material_stocks", (item) => item.material_id === material.id)[0] : null;
    const effectiveSafetyStock = Math.max(Number(stock?.safety_stock || 0), operationalRules.materialLowStockThreshold);
    return {
      name,
      qty: stock?.qty ?? 0,
      safety: effectiveSafetyStock,
      configuredSafety: stock?.safety_stock ?? 0,
      unit: material?.unit || "pcs",
    };
  });
  const lowBundleStock = stockRows.filter((item) => item.safety > 0 && item.qty <= item.safety);
  const operationStatusItems = [
    ...myStoreEvents.slice(0, 2).map((event) => ({
      id: `event-${event.id}`,
      title: event.name,
      desc: event.review_note || st("Store-created event requires UWELL approval before fans can see it."),
      status: event.review_status || event.approval_status || "pending",
      type: st("My event"),
      tab: "activities",
    })),
    ...storeMaterialRequests.slice(0, 2).map((request) => ({
      id: `material-${request.id}`,
      title: request.material_name || request.material_id,
      desc: request.review_note || `${request.warehouse || getStoreWarehouse(store)} / ${request.reason || st("Store material request")}`,
      status: request.status || "pending",
      type: st("Material"),
      tab: "me",
    })),
    ...displayUploads.filter((item) => ["pending", "rejected", "needs_update"].includes(item.status)).slice(0, 2).map((photo) => ({
      id: `photo-${photo.id}`,
      title: getStoreDisplayCategoryLabel(photo.category),
      desc: photo.review_note || (photo.category === "store_front_photo" ? st("Shown to fans on map after approval.") : st("Used for level review after approval.")),
      status: photo.status || "pending",
      type: st("Photo"),
      tab: "me",
    })),
  ];
  const todayOperatingQueue = [
    missingRequiredStorePhotos.length > 0 && {
      id: "photos-required",
      priority: st("Required"),
      title: st("Complete store photos"),
      desc: lang === "ar"
        ? st("Upload Store Front Photo and Display Photos. Store Front Photo is shown to fans on the map.")
        : `Upload ${missingRequiredStorePhotos.map((item) => item.label).join(" and ")}. Store Front Photo is shown to fans on the map.`,
      action: st("Upload photos"),
      tab: "me",
      status: `${missingRequiredStorePhotos.length} ${st("missing")}`,
      color: "volcano",
    },
    activeStoreCampaigns.length > 0 && {
      id: "verify-fans",
      priority: st("Daily"),
      title: st("Verify fan visits"),
      desc: st("Scan member QR or enter Fan ID after an in-store activity. Store users verify only; system rules award points."),
      action: st("Open Verify"),
      tab: "verify",
      status: `${activityVerifyRecords.filter((item) => item.status !== "duplicate").length} ${st("verified")}`,
      color: "green",
    },
    pendingCampaignClaims.length > 0 && {
      id: "campaign-results",
      priority: st("Review"),
      title: st("Submit campaign results"),
      desc: st("Finish UWELL campaign feedback so operations can review material usage and activity effect."),
      action: st("Submit result"),
      tab: "activities",
      status: `${pendingCampaignClaims.length} ${st("pending")}`,
      color: "gold",
    },
    lowBundleStock.length > 0 && {
      id: "material-low",
      priority: st("Stock"),
      title: st("Request low materials"),
      desc: `${lowBundleStock.slice(0, 2).map((item) => item.name).join(", ")} ${st("is near safety stock in your regional warehouse flow.")}`,
      action: st("Request materials"),
      tab: "me",
      status: `${lowBundleStock.length} ${st("low")}`,
      color: "orange",
    },
    myStoreEvents.some((event) => ["pending", "needs_update", "rejected"].includes(event.review_status || event.approval_status)) && {
      id: "store-event-review",
      priority: st("Event"),
      title: st("Check store event review"),
      desc: st("UWELL must approve store-created events before they appear in Fan Activities > Store Events."),
      action: st("View events"),
      tab: "activities",
      status: `${myStoreEvents.length} ${st("events")}`,
      color: "blue",
    },
  ].filter(Boolean).slice(0, 5);
  const todayQueueProgress = Math.round(([
    missingRequiredStorePhotos.length === 0,
    activeStoreCampaigns.length === 0 || activityVerifyRecords.length > 0,
    pendingCampaignClaims.length === 0,
    lowBundleStock.length === 0,
  ].filter(Boolean).length / 4) * 100);
  const storeHomeCommandItems = [
    {
      title: st("Setup readiness"),
      value: missingRequiredStorePhotos.length ? `${missingRequiredStorePhotos.length} ${st("missing")}` : st("Ready"),
      action: missingRequiredStorePhotos.length === 0 ? st("Manage photos") : st("Upload photos"),
      tab: "me",
      color: missingRequiredStorePhotos.length ? "volcano" : "green",
      ready: missingRequiredStorePhotos.length === 0,
      Icon: PictureOutlined,
    },
    {
      title: st("Fan verification"),
      value: `${activityVerifyRecords.length} ${st("records")}`,
      action: st("Open Verify"),
      tab: "verify",
      color: activityVerifyRecords.length ? "green" : "blue",
      ready: activityVerifyRecords.length > 0,
      Icon: QrcodeOutlined,
    },
    {
      title: st("Campaign execution"),
      value: `${activeStoreCampaigns.length} ${st("active")}`,
      action: st("View events"),
      tab: "activities",
      color: activeStoreCampaigns.length ? "gold" : "default",
      ready: activeStoreCampaigns.length > 0 || myStoreEvents.length > 0,
      Icon: FireOutlined,
    },
    {
      title: st("Materials"),
      value: lowBundleStock.length > 0 ? `${lowBundleStock.length} ${st("low")}` : st("Ready"),
      action: st("Request from your regional warehouse"),
      tab: "me",
      color: lowBundleStock.length > 0 ? "orange" : "green",
      ready: lowBundleStock.length === 0,
      Icon: InboxOutlined,
    },
  ];
  const storeHomePrimaryAction = storeHomeCommandItems.find((item) => !item.ready) || storeHomeCommandItems[0];

  const findRewardInventoryItem = (redemption) => {
    const material = storeMaterials.find((item) => item.id === redemption?.item_id || item.name === redemption?.item_name);
    const stocks = localDb.all("material_stocks") || [];
    const stock =
      stocks.find((item) => item.store_id === store.id && item.item_id === redemption?.item_id) ||
      stocks.find((item) => item.store_id === store.id && item.material_id === redemption?.item_id) ||
      (material ? stocks.find((item) => item.store_id === store.id && item.material_id === material.id) : null) ||
      null;

    if (!stock) return null;
    return {
      ...stock,
      item_id: stock.item_id || redemption.item_id,
      material_id: stock.material_id || material?.id || redemption.item_id,
      quantity_on_hand: stock.quantity_on_hand ?? stock.qty ?? 0,
    };
  };

  const handleLookupPickupCode = () => {
    const code = pickupCode.trim().toUpperCase();
    if (!code) {
      message.warning(st("Please enter a redemption code"));
      return;
    }
    const redemption = (localDb.all("mall_redemptions") || []).find((item) => item.redeem_code === code) || null;
    if (!redemption && !isLocal()) {
      const validation = {
        valid: true,
        message: "Remote pickup will be verified by the server according to reward type: Normal A/S, Premium S, Diamond approved assigned pickup.",
      };
      setPickupResult({
        redemption: {
          redeem_code: code,
          item_name: "Remote reward",
          status: "pending_pickup",
          remoteOnly: true,
        },
        inventoryItem: null,
        validation,
      });
      if (validation.valid) message.success(validation.message);
      else message.warning(validation.message);
      return;
    }
    const inventoryItem = findRewardInventoryItem(redemption);
    const validation = validateRewardPickup({ redemption, store, inventoryItem });
    setPickupResult({ redemption, inventoryItem, validation });
    if (!validation.valid) {
      message.warning(validation.message);
      return;
    }
    message.success(validation.message);
  };

  const handleConfirmRewardPickup = async () => {
    if (!pickupResult?.redemption) return;
    try {
      const localConfirm = () => confirmRewardPickup({
        localDb,
        redemption: pickupResult.redemption,
        store,
        inventoryItem: pickupResult.inventoryItem,
        pickedUpBy: store.owner_profile_id || store.id,
      });

      await confirmRewardPickupRemote(pickupResult.redemption.redeem_code || pickupCode, localConfirm);
      message.success(st("Reward pickup confirmed"));
      setPickupCode("");
      setPickupResult(null);
    } catch (err) {
      message.error(err?.message || st("Reward pickup failed"));
    }
  };

  const createStoreActivity = (values) => {
    const requestedPoints = Number(values.points || 0);
    const normalizedPoints = requestedPoints > 0
      ? Math.min(Math.max(requestedPoints, operationalRules.storeEventMinPoints), operationalRules.storeEventMaxPoints)
      : 0;
    const baseCampaign = buildStoreActivityCampaign({
      store,
      title: values.title,
      description: values.description,
      gift: values.gift,
      startDate: formatStoreDateValue(values.start_date),
      endDate: formatStoreDateValue(values.end_date),
      points: normalizedPoints,
    });
    const campaign = {
      ...baseCampaign,
      approval_status: "pending",
      review_status: "pending",
      review_required: true,
      fan_visible: false,
      store_cost_responsibility_acknowledged: true,
      uwell_support_requested: normalizedPoints > 0,
      requested_points_support: normalizedPoints,
      operational_rule_snapshot: {
        storeEventMinPoints: operationalRules.storeEventMinPoints,
        storeEventMaxPoints: operationalRules.storeEventMaxPoints,
      },
      submitted_by_store_id: store.id,
      submitted_by_store_name: store.name,
      submitted_at: new Date().toISOString(),
    };
    localDb.insert("campaigns", campaign);
    writeStoreAuditLog({
      store,
      action: "store_campaign_submitted",
      target: campaign.id,
      after: {
        approval_status: campaign.approval_status,
        review_status: campaign.review_status,
        store_cost_responsibility_acknowledged: true,
        uwell_support_requested: campaign.uwell_support_requested,
      },
      reason: "Store-created campaign requires backend approval before fan visibility.",
    });
    setAllCampaigns((items) => [campaign, ...items]);
    activityForm.resetFields();
    setActivityModalOpen(false);
    message.success(st("Activity submitted. It will appear in Fan Center after admin approval."));
  };

  const handleSubmitStoreActivity = async () => {
    try {
      const values = await activityForm.validateFields();
      modal.confirm({
        title: st("Submit store event for review?"),
        content: st("Materials, gifts, or costs may need to be handled by the store"),
        okText: t("store_entry_submit_review"),
        cancelText: st("View UWELL campaigns"),
        onOk: () => createStoreActivity(values),
        onCancel: () => setActiveTab("activities"),
      });
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || st("Activity submission failed"));
    }
  };

  const handleVerifyFanParticipation = () => {
    const code = activityVerifyCode.trim();
    if (!code) {
      message.warning(t("store_owner_scan_or_enter_fan_qr"));
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const fan = findFanByVerificationCode(code);
    const campaign = activeStoreCampaigns[0] || null;
    const duplicateSubject = fan?.id || normalizeFanVerificationCode(code);
    const duplicateKey = `${store.id}:${campaign?.id || "store_visit"}:${duplicateSubject}:${today}`;
    const existing = (localDb.all("store_activity_verifications") || []).find((item) => item.duplicate_key === duplicateKey);
    const isDuplicate = Boolean(existing);
    const decision = resolveStoreActivityVerification({
      code,
      fan,
      campaign,
      isDuplicate,
      ruleSettings: operationalRules,
    });
    const record = localDb.insert("store_activity_verifications", {
      store_id: store.id,
      store_name: store.name,
      fan_identifier: code,
      fan_id: fan?.id || null,
      fan_name: fan?.name || null,
      activity_id: campaign?.id || "store_visit",
      campaign_id: campaign?.id || null,
      campaign_name: campaign?.name || "Store visit",
      status: decision.status,
      verification_type: "store_event",
      verification_state: decision.verificationState,
      risk_status: isDuplicate ? "duplicate_attempt" : decision.requiresBackendReview ? "review_required" : "normal",
      points_award_status: decision.pointsAwardStatus,
      points_awarded: decision.points,
      duplicate_key: duplicateKey,
      requires_backend_review: decision.requiresBackendReview,
      operator_id: store.owner_profile_id || store.id,
      operator_name: store.owner_name || store.name,
      operator_role: "store_owner",
      created_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      note: `Store users do not give points. ${decision.reason}`,
    });
    if (decision.pointsAwardStatus === "system_awarded") {
      awardStoreActivityPoints({
        fan,
        store,
        campaign,
        points: decision.points,
        verificationId: record.id,
      });
    }
    localDb.insert("store_exposure_events", {
      store_id: store.id,
      store_name: store.name,
      event_type: "store_verified_visit",
      source: "store_verify",
      fan_identifier: code,
      created_at: new Date().toISOString(),
    });
    writeStoreAuditLog({
      store,
      action: isDuplicate ? "store_activity_duplicate_verification" : "store_activity_verification",
      target: record.id,
      after: {
        verification_state: record.verification_state,
        points_award_status: record.points_award_status,
        points_awarded: record.points_awarded,
        fan_id: record.fan_id,
        duplicate_key: duplicateKey,
      },
      reason: record.note,
    });
    setActivityVerifyRecords((items) => [record, ...items]);
    setActivityVerifyCode("");
    message.success(decision.pointsAwardStatus === "system_awarded"
      ? st("Participation verified. System awarded +{points} points.").replace("{points}", decision.points)
      : st("Participation recorded. System sent it to review, no points awarded yet."));
  };

  const handleScannerVerify = () => {
    setActivityScannerOpen(false);
    handleVerifyFanParticipation();
  };

  const exposureMetrics = (() => {
    const events = (localDb.all("store_exposure_events") || []).filter((item) => item.store_id === store.id);
    const countByType = (type) => events.filter((item) => item.event_type === type).length;
    const verifiedVisits = activityVerifyRecords.filter((item) => item.status !== "duplicate").length;
    return [
      { label: st("Views"), value: countByType("store_view") || 0 },
      { label: st("Navigation"), value: countByType("store_navigate") || 0 },
      { label: st("Verified visits"), value: countByType("store_verified_visit") || verifiedVisits },
    ];
  })();
  const levelExposureBenefits = [
    {
      title: st("Fan map exposure"),
      value: ["S", "A"].includes(store.level) ? st("Priority") : st("Basic listing"),
      tab: "me",
    },
    {
      title: st("Home recommendation eligibility"),
      value: store.level === "S" ? st("Featured") : store.level === "A" ? st("Recommended") : st("Upgrade needed"),
      tab: "activities",
    },
    {
      title: st("Reward pickup permission"),
      value: ["S", "A"].includes(store.level) ? st("Available") : st("Locked"),
      tab: "verify",
    },
    {
      title: st("Upgrade focus"),
      value: missingRequiredStorePhotos.length ? st("Photos first") : activeStoreCampaigns.length ? st("Verify visits") : st("Join campaign"),
      tab: missingRequiredStorePhotos.length ? "me" : activeStoreCampaigns.length ? "verify" : "activities",
    },
  ];
  const storeHomeValueItems = [
    st("Fan traffic"),
    st("Free campaign materials"),
    st("Official authorized store"),
    st("More exposure"),
  ];
  // ====== Dashboard Tab ======
  const Dashboard = () => (
    <div className="store-dashboard-v2">
      <Card size="small" className="so-card-main store-dashboard-section store-premium-section store-dashboard-hero" extra={<Button type="link" icon={<EditOutlined />} className="so-text-gold" onClick={handleOpenEditStore}>{t('edit')}</Button>}>
        <div className="store-dashboard-hero-grid">
          <div>
            <Text className="so-text-white30 so-fs11">{st("Store Level")}</Text>
            <Title level={4} className="so-text-gold so-m0">{store.name}</Title>
            <Tag color={levelBundle.color} className="so-mt4 so-fw600"><LevelIcon /> {levelBundleLabel}</Tag>
          </div>
          <div className="store-dashboard-level-mark" style={{ "--store-level-color": levelBundle.color }}>
            <LevelIcon />
            <strong>{store.level || "C"}</strong>
          </div>
        </div>
        <div className="so-grid-2 store-dashboard-meta">
            <div><EnvironmentOutlined /> <span>{formatStoreLocation(store)}</span></div>
          <div><PhoneOutlined /> <span>{store.phone || "N/A"}</span></div>
          <div><ShopOutlined /> <span>{store.id}</span></div>
          <div><ClockCircleOutlined /> <span>{store.created_at ? new Date(store.created_at).toLocaleDateString() : "N/A"}</span></div>
        </div>
      </Card>

      <div className="store-home-value-strip">
        <div className="store-home-value-grid">
          {storeHomeValueItems.map((item) => (
            <span key={item} className="store-home-benefit-chip">{item}</span>
          ))}
        </div>
      </div>

      {missingRequiredStorePhotos.length > 0 && (
        <div className="store-home-photo-nudge">
          <div>
            <span>{st("Photo tasks")}</span>
            <strong>{missingRequiredStorePhotos.length} {st("missing")}</strong>
          </div>
          <Button size="small" type="primary" icon={<UploadOutlined />} onClick={() => setActiveTab("me")}>
            {st("Upload photos")}
          </Button>
        </div>
      )}

      <Card size="small" className="so-card-subtle store-dashboard-section store-premium-section store-home-command-center" title={t("store_owner_today_execution_command")}>
        <div className="store-home-command-head">
          <div>
            <Text className="so-text-white30 so-fs11">{st("Next best action")}</Text>
            <strong>{storeHomePrimaryAction?.action || st("Keep verification, campaigns, photos, and materials current")}</strong>
          </div>
          <Tag color={todayQueueProgress >= 75 ? "green" : todayQueueProgress >= 50 ? "gold" : "volcano"}>
            {todayQueueProgress}% {st("ready")}
          </Tag>
        </div>
        <div className="store-home-command-grid">
          {storeHomeCommandItems.map(({ title, value, action, tab, ready, color, Icon }) => (
            <button key={title} type="button" className={ready ? "store-home-command-card is-ready" : "store-home-command-card"} onClick={() => setActiveTab(tab)}>
              <span className="store-home-command-icon"><Icon /></span>
              <span className="store-home-command-title">{title}</span>
              <strong>{value}</strong>
              <Tag color={color}>{action}</Tag>
            </button>
          ))}
        </div>
      </Card>

      <Card size="small" className="so-card-subtle store-dashboard-section store-premium-section store-level-compact-panel" title={t("store_owner_level_exposure_pickup_rules")}>
        <div className="store-level-benefit-grid store-level-compact-grid">
          {levelExposureBenefits.map((item) => (
            <button key={item.title} type="button" className="store-level-benefit-card store-level-compact-action" onClick={() => setActiveTab(item.tab)}>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
            </button>
          ))}
        </div>
      </Card>

      <Row gutter={[8, 8]}>
        {[
          { icon: <FireOutlined />, label: st("Active campaigns"), value: activeStoreCampaigns.length, color: "#FFD700", tab: "activities" },
          { icon: <GiftOutlined />, label: st("Pending claims"), value: pendingCampaignClaims.length, color: "#F5A623", tab: "verify" },
          { icon: <PictureOutlined />, label: st("Approved photos"), value: displayApproved, color: "#52c41a", tab: "me" },
          { icon: <UploadOutlined />, label: st("Photos in review"), value: displayPending, color: "#1677ff", tab: "me" },
        ].map((card) => (
          <Col span={12} key={card.label}>
            <button type="button" className="store-dashboard-stat so-card-subtle" onClick={() => setActiveTab(card.tab)}>
              <span style={{ color: card.color }}>{card.icon}</span>
              <strong>{card.value}</strong>
              <em>{card.label}</em>
            </button>
          </Col>
        ))}
      </Row>

      <Card size="small" className="so-card-subtle store-dashboard-section" title={st("Exposure this week")}>
        <Row gutter={[8, 8]}>
          {exposureMetrics.map((item) => (
            <Col span={8} key={item.label}>
              <div className="store-dashboard-stat so-card-subtle">
                <strong>{item.value}</strong>
                <em>{item.label}</em>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card size="small" className="so-card-subtle store-dashboard-section store-today-queue store-queue-compact-panel" title={st("Today operating queue")}>
        <div className="store-queue-progress store-queue-compact-progress">
          <div>
            <strong>{todayQueueProgress}% {st("ready")}</strong>
          </div>
          <Progress type="circle" size={54} percent={todayQueueProgress} strokeColor="#ccff00" railColor="rgba(82,62,24,0.12)" />
        </div>
        {todayOperatingQueue.length > 0 ? todayOperatingQueue.map((task) => (
          <button key={task.id} type="button" className="store-queue-task store-queue-compact-task" onClick={() => setActiveTab(task.tab)}>
            <span className="store-queue-priority">{task.priority}</span>
            <div className="store-queue-task-main">
              <strong>{task.title}</strong>
              <Tag color={task.color}>{task.status}</Tag>
            </div>
            <b>{task.action}</b>
          </button>
        )) : (
          <div className="store-queue-empty">
            <CheckCircleOutlined />
            <strong>{st("All core tasks are clear")}</strong>
            <p>{st("New photo feedback, material requests, activity reviews, or verification work will appear here.")}</p>
          </div>
        )}
      </Card>

      <Card size="small" className="so-card-subtle store-dashboard-section store-home-status-card" title={t("store_owner_store_operations_status")}>
        {operationStatusItems.length > 0 ? operationStatusItems.map((item) => (
          <button key={item.id} type="button" className="store-dashboard-row store-feedback-row store-home-data-row" onClick={() => setActiveTab(item.tab)}>
            <div>
              <strong>{item.title}</strong>
              <span className="store-home-row-meta">{item.type}</span>
            </div>
            <Tag color={reviewStatusColor(item.status)}>{st(reviewStatusLabel(item.status))}</Tag>
          </button>
        )) : (
          <div className="store-dashboard-row">
            <div>
              <strong>{st("No pending store feedback")}</strong>
              <span className="store-home-row-meta">{st("Clear")}</span>
            </div>
            <Tag color="green">{st("Clear")}</Tag>
          </div>
        )}
      </Card>

      <Card size="small" className="so-card-subtle store-dashboard-section store-home-campaign-status-card" title={t("store_owner_campaign_status")} extra={<Button size="small" onClick={() => setActiveTab("activities")}>{t("store_owner_view_campaigns")}</Button>}>
        {storeCampaignsForDashboard.slice(0, 3).map((campaign) => {
          const claim = claimedCampaigns.find((item) => item.campaign_id === campaign.id);
          return (
            <div key={campaign.id} className="store-dashboard-row store-home-data-row">
              <div>
                <strong>{getCampaignDisplayCopy(campaign).name}</strong>
                <span className="store-home-row-meta">{campaign.source === "store_application" ? st("My event") : st("UWELL campaign")}</span>
              </div>
              <Tag color={claim ? "green" : campaign.approval_status === "pending" ? "orange" : campaign.status === "ongoing" ? "gold" : "default"}>
                {claim ? st("Claimed") : campaign.approval_status === "pending" ? st("Pending approval") : campaign.status === "ongoing" ? st("Available") : st(campaignStatusLabel(campaign.status))}
              </Tag>
            </div>
          );
        })}
        {storeCampaignsForDashboard.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No assigned campaigns yet" />}
      </Card>

      <Card size="small" className="so-card-subtle store-dashboard-section" title={t("store_owner_material_inventory")} extra={<Button size="small" onClick={() => setActiveTab("me")}>{t("store_owner_request_materials")}</Button>}>
        <div className="store-stock-list">
          {stockRows.slice(0, 5).map((item) => {
            const percent = item.safety > 0 ? Math.min(100, Math.round((item.qty / (item.safety * 2)) * 100)) : 100;
            const danger = item.safety > 0 && item.qty <= item.safety;
            return (
              <div key={item.name} className="store-stock-row">
                <div className="store-stock-row-meta">
                  <strong>{item.name}</strong>
                  <span>{item.qty} {item.unit} / safety {item.safety}</span>
                </div>
                <Progress percent={percent} showInfo={false} status={danger ? "exception" : "normal"} />
              </div>
            );
          })}
        </div>
        {lowBundleStock.length > 0 && <Tag color="volcano">{lowBundleStock.length} {st("materials below safety stock")}</Tag>}
      </Card>
    </div>
  );

  // ====== Campaigns Tab ======
  const CampaignsTab = () => {
    const storeCampaigns = allCampaigns.filter((c) => c.target_stores && c.target_stores.includes(store.id) && c.source !== "store_application");
    const pendingReview = claimedCampaigns.filter((c) => c.status === "in_progress");

    return (
      <div>
        {storeBottomNavAlerts.activities && (
          <ActionNeededStrip
            title={pendingCampaignClaims.length > 0 ? st("Submit campaign result") : st("Check activity review")}
            status={pendingCampaignClaims.length > 0 ? `${pendingCampaignClaims.length} ${st("pending")}` : `${myStoreEvents.length} ${st("events")}`}
            actions={[
              {
                label: pendingCampaignClaims.length > 0 ? st("Submit result") : st("View events"),
                primary: true,
                onClick: pendingCampaignClaims[0] ? () => handleOpenReview(pendingCampaignClaims[0]) : scrollToActivityActionSection,
              },
            ]}
          />
        )}
        <Card size="small" className="so-card-subtle store-dashboard-section store-activity-guidance-strip" style={{ marginBottom: 12 }}>
          <div className="store-activity-guidance-main">
            <div>
              <Text strong className="so-text-light">{t("store_owner_activity_application")}</Text>
            </div>
            <Button type="primary" icon={<FireOutlined />} onClick={() => setActivityModalOpen(true)}>
              {t("store_owner_apply")}
            </Button>
          </div>
          <div className="store-activity-guidance-grid">
            <div className="store-activity-function-card">
              <strong>{st("Official campaigns")}</strong>
              <span>{st("View details, apply, wait for materials, run activity.")}</span>
            </div>
            <div className="store-activity-function-card">
              <strong>{st("Store-created events")}</strong>
              <span>{st("Edit content, time, and result. Send to UWELL review.")}</span>
            </div>
          </div>
        </Card>

        {myStoreEvents.length > 0 && (
          <div className="so-mb16" ref={activityActionSectionRef}>
            <Text strong className="so-text-gold so-fs14 so-dblock so-mb8">
              <FireOutlined /> {st("My store events")}
            </Text>
            {myStoreEvents.map((event) => (
              <Card key={event.id} size="small" className="so-card-subtle store-dashboard-section" style={{ marginBottom: 8 }}>
                <div className="store-dashboard-row">
                  <div>
                    <strong>{event.name}</strong>
                    <p>{event.review_note || st("UWELL review decides whether this appears in Fan Activities > Store Events.")}</p>
                    <small className="so-text-white30">
                      {event.store_cost_responsibility_acknowledged
                        ? st("Cost responsibility acknowledged. UWELL support is not automatic.")
                        : st("Please confirm cost responsibility before resubmission.")}
                    </small>
                  </div>
                  <Tag color={reviewStatusColor(event.review_status || event.approval_status)}>
                    {st(reviewStatusLabel(event.review_status || event.approval_status))}
                  </Tag>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Active Campaigns for this store */}
        {storeCampaigns.length > 0 && (
          <div className="so-mb16">
            <Text strong className="so-text-gold so-fs14 so-dblock so-mb8">
              <FireOutlined /> {st("UWELL campaigns")}
            </Text>
            {storeCampaigns.map((camp) => {
              const claimed = claimedCampaigns.find((c) => c.campaign_id === camp.id);
              const days = Math.ceil((new Date(camp.end_date) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <Card
                  key={camp.id}
                  size="small"
                  className={camp.status === "ongoing" ? "store-campaign-card-ongoing" : "store-campaign-card-default"}
                >
                  <div className="store-campaign-card-body">
                    <div className="store-campaign-card-main">
                      <div className="store-campaign-card-title-row">
                        <Text strong className="so-text-light so-fs13">{getCampaignDisplayCopy(camp).name}</Text>
                        <Tag color={camp.approval_status === "pending" ? "orange" : camp.status === "ongoing" ? "gold" : "default"} className="so-fs10">
                          {camp.approval_status === "pending" ? st("Pending approval") : st(campaignStatusLabel(camp.status))}
                        </Tag>
                      </div>
                      <div className="store-campaign-card-meta">
                        {days > 0 && camp.status === "ongoing" && <span>{days} {t('days')}</span>}
                      </div>
                      {claimed && (
                        <div className="so-mt6">
                          <Tag color={claimed.status === "completed" ? "green" : claimed.status === "in_progress" ? "blue" : claimed.status === "pending" ? "gold" : "default"} className="so-fs10">
                            {claimed.status === "completed" ? t('visit_completed') : claimed.status === "in_progress" ? t('camp_active') : claimed.status === "pending" ? t('already_claimed') : claimed.status}
                          </Tag>
                        </div>
                      )}
                    </div>
                    <div className="so-text-right so-minw80">
                      {!claimed && camp.status === "ongoing" && (
                        <Button type="primary" size="small" className="so-btn-gold" onClick={() => handleClaim(camp)}>
                          {t('claim_campaign')}
                        </Button>
                      )}
                      {claimed && claimed.status === "in_progress" && (
                        <Button size="small" className="so-btn-success" onClick={() => handleOpenReview(claimed)}>
                          {t('submit_review')}
                        </Button>
                      )}
                      {claimed && claimed.status === "completed" && (
                        <Button size="small" className="so-btn-warning" onClick={() => handleOpenReview(claimed)}>
                          {t('view_review')}
                        </Button>
                      )}
                      {days > 0 && camp.status === "ongoing" && days <= 7 && <span className="store-campaign-card-urgent">{t('days_remaining')}</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReview.length > 0 && (
          <div>
            <Text strong className="so-text-green so-fs13 so-dblock so-mb8">
              {t('pending_review')} ({pendingReview.length})
            </Text>
            {pendingReview.map((claim) => (
              <Card key={claim.id} size="small" className="so-card-green">
                <div className="so-flex-between">
                  <Text className="so-text-light so-fs13">{claim.campaign_name}</Text>
                  <Button size="small" className="so-btn-green" onClick={() => handleOpenReview(claim)}>
                    {t('review')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {storeCampaigns.length === 0 && myStoreEvents.length === 0 && <Empty description={t('no_data')} />}
      </div>
    );
  };

  const handleOpenReview = (claim) => {
    setReviewForm({
      materials_used: claim.materials_used || 0,
      effect: claim.effect || "good",
      feedback: claim.feedback || "",
    });
    setReviewModal({ open: true, claim });
  };

  const refreshSStoreReportHistory = async () => {
    if (!store?.id || !isActiveSStoreAccount) return;
    ensureTrialSStoreReportHistory(store);
    const [sellThrough, productInventory, materialInventory] = await Promise.all([
      getSStoreSellThroughHistory(store.id),
      getSStoreInventoryHistory(store.id),
      getSStoreMaterialInventoryHistory(store.id),
    ]);
    setSStoreSellThroughHistory(sellThrough);
    setSStoreProductInventoryHistory(productInventory);
    setSStoreMaterialInventoryHistory(materialInventory);
  };

  const handleSubmitSStoreSellThrough = async () => {
    try {
      const values = await sSellThroughForm.validateFields();
      await submitSStoreSellThrough({
        store_id: store.id,
        period_type: values.period_type,
        period_start: formatStoreDateValue(values.period_start),
        period_end: formatStoreDateValue(values.period_end),
        open_system_sold_qty: Number(values.open_system_sold_qty || 0),
        disposable_sold_qty: Number(values.disposable_sold_qty || 0),
        note: values.note || "",
      }, storeOwnerSStoreProfile);
      sSellThroughForm.resetFields();
      await refreshSStoreReportHistory();
      message.success(st("S Store sell-through submitted."));
    } catch (error) {
      message.error(error?.message || st("S Store sell-through submission failed."));
    }
  };

  const handleSubmitSStoreProductInventory = async () => {
    try {
      const values = await sProductInventoryForm.validateFields();
      await submitSStoreInventory({
        store_id: store.id,
        open_system_current_stock: Number(values.open_system_current_stock || 0),
        open_system_target_stock: Number(values.open_system_target_stock || 0),
        disposable_current_stock: Number(values.disposable_current_stock || 0),
        disposable_target_stock: Number(values.disposable_target_stock || 0),
        note: values.note || "",
      }, storeOwnerSStoreProfile);
      sProductInventoryForm.resetFields();
      await refreshSStoreReportHistory();
      message.success(st("S Store product inventory submitted."));
    } catch (error) {
      message.error(error?.message || st("S Store product inventory submission failed."));
    }
  };

  const handleSubmitSStoreMaterialInventory = async () => {
    try {
      const values = await sMaterialInventoryForm.validateFields();
      await submitSStoreMaterialInventory({
        store_id: store.id,
        material_type: values.material_type,
        current_quantity: Number(values.current_quantity || 0),
        target_quantity: Number(values.target_quantity || 0),
        note: values.note || "",
      }, storeOwnerSStoreProfile);
      sMaterialInventoryForm.resetFields();
      await refreshSStoreReportHistory();
      message.success(st("S Store material inventory submitted."));
    } catch (error) {
      message.error(error?.message || st("S Store material inventory submission failed."));
    }
  };

  // ====== Materials Tab ======
  const handleRequestMaterial = async (material) => {
    setMaterialRequesting(true);
    try {
      const region = normalizeRegion(store);
      const warehouse = getStoreWarehouse(store);
      const request = localDb.insert('material_requests', {
        requester: store?.owner_name || store?.name || 'Store owner',
        requester_role: 'store_owner',
        store_id: store?.id,
        store_name: store?.name,
        region,
        warehouse,
        material_id: material.id,
        material_name: material.name,
        qty: 1,
        reason: 'Store material request',
        campaign_relation: activeStoreCampaigns[0]?.id || '',
        priority: lowBundleStock.some((item) => item.name === material.name) ? 'high' : 'normal',
        status: 'pending',
        requested_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      // Also create an outbound record
      localDb.insert('material_outbound', {
        store_id: store?.id,
        material_id: material.id,
        qty: 1,
        status: 'pending',
        reason: 'Store material request',
        region,
        warehouse,
        created_at: new Date().toISOString(),
      });
      writeStoreAuditLog({
        store,
        action: "material_request_submitted",
        target: request.id,
        after: {
          region,
          warehouse,
          material_name: material.name,
          qty: 1,
          status: "pending",
        },
        reason: "Store material request uses the regional warehouse and awaits backend approval.",
      });
      message.success(st("Requested {material}. Pending approval.").replace("{material}", material.name));
    } catch { message.error(st("Request failed.")); }
    finally { setMaterialRequesting(false); }
  };
  const MaterialsTab = () => (
    <div className="store-material-workbench">
      <Card
        size="small"
        className="store-material-pack-card"
      >
        <div className="store-material-pack-head">
          <LevelIcon className="so-fs24" style={{ color: levelBundle.color }} />
          <div>
            <Text strong className="so-text-light">{levelBundleLabel}{t('material_pack')}</Text>
          </div>
          <Tag color="gold">{getStoreWarehouse(store)}</Tag>
        </div>
        <Divider className="store-material-pack-divider" />
        <div className="store-material-pack-grid">
          {levelBundle.materials.map((m, i) => {
            const mat = storeMaterials.find((mt) => mt.name === m);
            return (
              <div key={i} className="so-tag-material">
                <div className="so-material-name">{m}</div>
                <div className="so-material-unit">{mat ? mat.unit_cost + " SAR/" + mat.unit : ""}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {storeMaterialRequests.length > 0 && (
        <Card size="small" className="so-card-subtle store-material-requests-card">
          <div className="store-material-section-head">
            <Text strong>{st("My material requests")}</Text>
            <Tag color="gold">{storeMaterialRequests.length}</Tag>
          </div>
          <div className="store-material-request-list">
            {storeMaterialRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="store-material-request-row">
                <div>
                  <strong>{request.material_name || request.material_id}</strong>
                  <span>{request.warehouse || getStoreWarehouse(store)}</span>
                  {request.review_note && <small>{request.review_note}</small>}
                </div>
                <Tag color={reviewStatusColor(request.status)}>{st(reviewStatusLabel(request.status))}</Tag>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="store-material-section-head">
        <Text strong>{t('store_materials')}</Text>
        <Tag color="gold">{normalizeRegion(store)}</Tag>
      </div>
      <div className="store-material-catalog-grid">
        {storeMaterials.map((m) => (
          <div key={m.id} className="store-material-catalog-item">
            <div>
              <strong>{m.name}</strong>
              <span>{m.category}</span>
            </div>
            <div className="store-material-catalog-action">
              <span>{m.unit_cost} SAR</span>
              <Button
                size="small"
                type="primary"
                loading={materialRequesting}
                onClick={() => handleRequestMaterial(m)}
                className="store-material-request-button"
              >
                {st("Request")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ShowcaseTab = () => (
    <div>
      <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
        {STORE_PHOTO_TYPES.map((photoType) => {
          const records = displayUploads.filter((item) => item.category === photoType.key);
          const pending = records.filter((item) => item.status === "pending").length;
          const approved = records.filter((item) => item.status === "approved").length;
          const latestRejected = records.find((item) => ["rejected", "needs_update"].includes(item.status));
          return (
            <Col span={24} key={photoType.key}>
              <Card size="small" className="so-card-dark-border">
                <div className="so-flex-between so-mb8">
                  <div>
                    <Text strong className="so-text-light">{st(photoType.label)}</Text>
                    <div className="so-text-white30 so-fs11">{st(photoType.purpose)}</div>
                    <Tag color={approved ? "green" : pending ? "gold" : "volcano"} style={{ marginTop: 6 }}>
                      {approved ? st("Approved") : pending ? st("In review") : st("Missing")}
                    </Tag>
                  </div>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => handleDisplayUpload(photoType.key, file)}
                  >
                    <Button size="small" icon={<UploadOutlined />}>{st("Upload")}</Button>
                  </Upload>
                </div>
                {latestRejected && (
                  <div className="store-dashboard-row store-feedback-row">
                    <div>
                      <strong>{reviewStatusLabel(latestRejected.status)}</strong>
                      <p>{latestRejected.review_note || "Please upload a clearer photo for UWELL review."}</p>
                    </div>
                    <Tag color={reviewStatusColor(latestRejected.status)}>{st("Reupload")}</Tag>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row gutter={[8, 8]}>
        {DISPLAY_CATEGORIES.map((category) => {
          const records = displayUploads.filter((item) => item.category === category.key);
          const pending = records.filter((item) => item.status === "pending").length;
          const approved = records.filter((item) => item.status === "approved").length;
          const latestRejected = records.find((item) => ["rejected", "needs_update"].includes(item.status));
          return (
            <Col span={24} key={category.key}>
              <Card size="small" className="so-card-dark-border">
                <div className="so-flex-between so-mb8">
                  <div>
                    <Text strong className="so-text-light">{getStoreDisplayCategoryLabel(category.key)}</Text>
                    <div className="so-text-white30 so-fs11">{st("Approved {count} / In review {pending}").replace("{count}", approved).replace("{pending}", pending)}</div>
                  </div>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => handleDisplayUpload(category.key, file)}
                  >
                    <Button size="small" icon={<UploadOutlined />}>{st("Upload")}</Button>
                  </Upload>
                </div>
                {records.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {records.slice(0, 3).map((item) => (
                      <div key={item.id} style={{ position: "relative" }}>
                        <img src={item.image_url} alt={getStoreDisplayCategoryLabel(category.key)} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)" }} />
                        <Tag color={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "gold"} style={{ position: "absolute", left: 4, top: 4, margin: 0 }}>
                          {item.status === "approved" ? st("Approved") : item.status === "rejected" ? st("Rejected") : st("In review")}
                        </Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty className="store-photo-empty-state" image={Empty.PRESENTED_IMAGE_SIMPLE} description={st("No photos yet")} />
                )}
                {latestRejected && (
                  <div className="store-dashboard-row store-feedback-row" style={{ marginTop: 10 }}>
                    <div>
                      <strong>{reviewStatusLabel(latestRejected.status)}</strong>
                      <p>{latestRejected.review_note || "Please upload a clearer photo for UWELL review."}</p>
                    </div>
                    <Tag color={reviewStatusColor(latestRejected.status)}>{st("Reupload")}</Tag>
                  </div>
                )}
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );

  const SStoreReportTab = () => (
    <div className="store-s-report-workbench store-premium-section-stack">
      {storeBottomNavAlerts["s-report"] && (
        <ActionNeededStrip
          title={st("Submit first S Report")}
          status={st("No sell-through records yet")}
          actions={[{ label: st("Open report"), primary: true, onClick: scrollToSReportFormSection }]}
        />
      )}
      <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-hero">
        <div className="store-s-report-hero-head">
          <div>
            <Text strong className="so-text-light">{t("store_owner_s_report_title")}</Text>
          </div>
          <Tag color="green">UWELL Brand Store</Tag>
        </div>
        <div className="store-s-report-hero-actions">
          <div className="store-execution-command-grid">
            {sStoreReportExecutionItems.map((title) => (
              <div className="store-execution-command-card" key={title}>
                <span>{t(title)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="store-s-report-mode-bar" aria-label="S Store report modes">
        {[
          { key: "weekly", title: t("store_owner_weekly_sell_through"), meta: t("store_owner_sell_through") },
          { key: "monthly", title: t("store_owner_monthly_sell_through"), meta: t("store_owner_sell_through") },
          { key: "product", title: t("store_owner_product_stock_check"), meta: t("store_owner_product_inventory") },
          { key: "material", title: t("store_owner_material_stock_check"), meta: t("store_owner_material_inventory") },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            className="store-s-report-mode-card"
            onClick={scrollToSReportFormSection}
          >
            <strong>{item.title}</strong>
            <span>{item.meta}</span>
          </button>
        ))}
      </div>

      <div className="store-s-report-form-grid" ref={sReportFormSectionRef}>
        <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-form-panel" data-step="01" title={t("store_owner_sell_through")}>
          <Form form={sSellThroughForm} layout="vertical" initialValues={{ period_type: "weekly" }}>
            <Form.Item name="period_type" label={st("Period type")} rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "weekly", label: st("Weekly") },
                  { value: "monthly", label: st("Monthly") },
                ]}
              />
            </Form.Item>
            <Row gutter={8} className="store-s-report-pair-row">
              <Col span={12}>
                <Form.Item name="period_start" label={st("Period start")} rules={[{ required: true }]}>
                  <DatePicker format="YYYY-MM-DD" placeholder="YYYY-MM-DD" classNames={{ popup: { root: "store-s-report-calendar-dropdown" } }} className="so-input-dark" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="period_end" label={st("Period end")} rules={[{ required: true }]}>
                  <DatePicker format="YYYY-MM-DD" placeholder="YYYY-MM-DD" classNames={{ popup: { root: "store-s-report-calendar-dropdown" } }} className="so-input-dark" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="open_system_sold_qty" label={st("Open-system sold quantity")} rules={[{ required: true }]}>
              <InputNumber {...sReportNumberInputProps} />
            </Form.Item>
            <Form.Item name="disposable_sold_qty" label={st("Disposable sold quantity")} rules={[{ required: true }]}>
              <InputNumber {...sReportNumberInputProps} />
            </Form.Item>
            <Form.Item name="note" label={st("Note")}>
              <Input.TextArea rows={1} className="so-input-dark" />
            </Form.Item>
            <Button type="primary" block onClick={handleSubmitSStoreSellThrough}>{t("store_owner_submit_sell_through")}</Button>
          </Form>
        </Card>

        <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-form-panel" data-step="02" title={t("store_owner_product_inventory")}>
          <Form form={sProductInventoryForm} layout="vertical">
            <Row gutter={8} className="store-s-report-pair-row">
              <Col span={12}>
                <Form.Item name="open_system_current_stock" label={st("Open-system current stock")} rules={[{ required: true }]}>
                  <InputNumber {...sReportNumberInputProps} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="open_system_target_stock" label={st("Open-system target stock")} rules={[{ required: true }]}>
                  <InputNumber {...sReportNumberInputProps} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="disposable_current_stock" label={st("Disposable current stock")} rules={[{ required: true }]}>
                  <InputNumber {...sReportNumberInputProps} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="disposable_target_stock" label={st("Disposable target stock")} rules={[{ required: true }]}>
                  <InputNumber {...sReportNumberInputProps} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label={st("Note")}>
              <Input.TextArea rows={1} className="so-input-dark" />
            </Form.Item>
            <Button type="primary" block onClick={handleSubmitSStoreProductInventory}>{t("store_owner_submit_product_inventory")}</Button>
          </Form>
        </Card>

        <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-form-panel" data-step="03" title={t("store_owner_material_inventory")}>
          <Form form={sMaterialInventoryForm} layout="vertical">
            <Form.Item name="material_type" label={st("Material type")} rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "lightbox", label: "Lightbox" },
                  { value: "acrylic_stand", label: "Acrylic stand" },
                  { value: "poster", label: "Poster" },
                  { value: "catalog", label: "Catalog" },
                  { value: "gift", label: "Gift material" },
                ]}
              />
            </Form.Item>
            <Row gutter={8} className="store-s-report-pair-row">
              <Col span={12}>
                <Form.Item name="current_quantity" label={st("Current quantity")} rules={[{ required: true }]}>
                  <InputNumber {...sReportNumberInputProps} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="target_quantity" label={st("Target quantity")} rules={[{ required: true }]}>
                  <InputNumber {...sReportNumberInputProps} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="note" label={st("Note")}>
              <Input.TextArea rows={1} className="so-input-dark" />
            </Form.Item>
            <Button type="primary" block onClick={handleSubmitSStoreMaterialInventory}>{t("store_owner_submit_material_inventory")}</Button>
          </Form>
        </Card>
      </div>

      <div className="store-s-report-history store-s-report-history-lockup">
        <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-history-card" title={t("store_owner_latest_sell_through")}>
          {sStoreSellThroughHistory.length > 0 ? sStoreSellThroughHistory.slice(0, 3).map((record) => (
            <div key={record.id} className="store-dashboard-row">
              <div>
                <strong>{record.period_type === "monthly" ? st("Monthly") : st("Weekly")} · {record.period_start} to {record.period_end}</strong>
                <p>{st("Open-system")} {record.open_system_sold_qty || 0} / {st("Disposable")} {record.disposable_sold_qty || 0}</p>
              </div>
              <Tag color="green">{st("Submitted and locked")}</Tag>
            </div>
          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={st("No sell-through records yet")} />}
        </Card>

        <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-history-card" title={t("store_owner_latest_product_inventory")}>
          {sStoreProductInventoryHistory.length > 0 ? sStoreProductInventoryHistory.slice(0, 3).map((record) => (
            <div key={record.id} className="store-dashboard-row">
              <div>
                <strong>{st("Open-system")} {record.open_system_current_stock || 0}/{record.open_system_target_stock || 0}</strong>
                <p>{st("Disposable")} {record.disposable_current_stock || 0}/{record.disposable_target_stock || 0}</p>
              </div>
              <Tag color={record.low_stock ? "volcano" : "green"}>{record.low_stock ? st("Low stock") : st("Locked")}</Tag>
            </div>
          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={st("No product inventory records yet")} />}
        </Card>

        <Card size="small" className="so-card-subtle store-dashboard-section store-s-report-history-card" title={t("store_owner_latest_material_inventory")}>
          {sStoreMaterialInventoryHistory.length > 0 ? sStoreMaterialInventoryHistory.slice(0, 3).map((record) => (
            <div key={record.id} className="store-dashboard-row">
              <div>
                <strong>{record.material_type}</strong>
                <p>{st("Current")} {record.current_quantity || 0} / {st("Target")} {record.target_quantity || 0}</p>
              </div>
              <Tag color={record.low_stock ? "volcano" : "green"}>{record.low_stock ? st("Low stock") : st("Locked")}</Tag>
            </div>
          )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={st("No material inventory records yet")} />}
        </Card>
      </div>
    </div>
  );

  const RewardPickupTab = () => (
    <div className="store-verify-workbench store-premium-section-stack">
      {storeBottomNavAlerts.verify && (
        <ActionNeededStrip
          title={st("Verify fan visit")}
          status={`${activeStoreCampaigns.length} ${st("active")}`}
          actions={[
            { label: t("store_owner_scan"), primary: true, onClick: () => setActivityScannerOpen(true) },
            { label: st("Manual fallback"), onClick: () => setActivityScannerOpen(true) },
          ]}
        />
      )}
      <Card size="small" className="so-card-subtle store-dashboard-section store-verify-action-strip">
        <div>
          <Text strong className="so-text-light">{st("Verify actions")}</Text>
          <div className="store-verify-action-grid">
            <div>
              <strong>{st("Fan participation")}</strong>
              <span>{st("Scan fan identity QR to verify participation.")}</span>
            </div>
            <div>
              <strong>{st("Manual fallback")}</strong>
              <span>{st("Enter Fan ID or email when QR is unavailable.")}</span>
            </div>
            <div>
              <strong>{st("Reward redemption")}</strong>
              <span>{st("Check redemption code before handing over reward.")}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="store-verify-method-grid">
        <Card size="small" className="so-card-subtle store-dashboard-section store-verify-method-card">
          <div className="store-verify-method-icon"><QrcodeOutlined /></div>
          <div>
            <strong>{st("Scan fan member QR")}</strong>
            <p>{st("Scan fan QR to confirm participation.")}</p>
          </div>
          <Button type="primary" icon={<QrcodeOutlined />} onClick={() => setActivityScannerOpen(true)}>{t("store_owner_scan")}</Button>
        </Card>

        <Card size="small" className="so-card-subtle store-dashboard-section store-verify-method-card">
          <div className="store-verify-method-icon"><UserOutlined /></div>
          <div>
            <strong>{st("Enter Fan ID or email")}</strong>
            <p>{st("Use when camera, QR, or assisted check-in needs fallback.")}</p>
          </div>
          <div className="store-verify-inline-form">
            <Input
              className="so-input-dark"
              value={activityVerifyCode}
              onChange={(event) => setActivityVerifyCode(event.target.value)}
              placeholder={st("Fan ID, email, or activity code")}
            />
            <Button onClick={handleVerifyFanParticipation}>{t("store_owner_verify_visit")}</Button>
          </div>
        </Card>
      </div>

      <Card size="small" className="so-card-subtle store-dashboard-section" title={t("store_owner_reward_pickup")}>
        <div className="so-flex-gap8" style={{ alignItems: "stretch" }}>
          <Input
            value={pickupCode}
            onChange={(event) => setPickupCode(event.target.value)}
            placeholder={st("Enter redemption code")}
            className="so-input-dark"
          />
          <Button type="primary" onClick={handleLookupPickupCode}>{t("store_owner_check")}</Button>
        </div>
        <div className="so-text-white30 so-fs11 so-mt8">
          {st("Normal: A/S stores. Premium: S stores. Diamond: backend-approved pickup only.")}
        </div>
        <Button type="link" size="small" onClick={() => setSLevelPolicyOpen(true)} style={{ paddingLeft: 0 }}>
          {st("S-level responsibilities and incentives")}
        </Button>
      </Card>

      {!["A", "S"].includes(store.level) && (
        <Card size="small" className="so-card-dark-border">
          <Tag color="volcano">{st("This store cannot fulfill fan rewards until A/S approval.")}</Tag>
        </Card>
      )}

      {pickupResult?.redemption && (
        <Card size="small" className="so-card-dark-border store-pickup-result-card" title={st("Pickup validation result")}>
          <div className="store-dashboard-row">
            <div>
              <strong>{pickupResult.validation.valid ? st("Eligible for pickup") : st("Blocked before handover")}</strong>
              <p>{st("Confirm only when the validation state is eligible.")}</p>
            </div>
            <Tag color={pickupResult.validation.valid ? "green" : "volcano"}>{pickupResult.validation.message}</Tag>
          </div>
          <div className="store-pickup-result-grid">
            <div>
              <span>{st("Reward item")}</span>
              <strong>{pickupResult.redemption.item_name}</strong>
            </div>
            <div>
              <span>{st("Redemption code")}</span>
              <strong>{pickupResult.redemption.redeem_code}</strong>
            </div>
            <div>
              <span>{st("Record status")}</span>
              <strong>{pickupResult.redemption.status}</strong>
            </div>
          </div>
          <Button
            type="primary"
            disabled={!pickupResult.validation.valid}
            onClick={handleConfirmRewardPickup}
            block
          >
            {t("store_owner_confirm_pickup")}
          </Button>
        </Card>
      )}

      <Modal
        open={sLevelPolicyOpen}
        onCancel={() => setSLevelPolicyOpen(false)}
        footer={<Button type="primary" onClick={() => setSLevelPolicyOpen(false)}>{t("store_owner_i_understand")}</Button>}
        title={sLevelStorePolicy.title}
        centered
        width={560}
      >
        <Typography.Paragraph>
          {st("Reward pickup partners follow reward type rules: Normal rewards can be fulfilled by A/S stores, Premium rewards by S stores, and Diamond rewards only after backend approval and assigned pickup.")}
        </Typography.Paragraph>
        <Typography.Title level={5}>{st("Responsibilities")}</Typography.Title>
        <ul>
          {sLevelStorePolicy.responsibilities.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <Typography.Title level={5}>{st("Store rewards and consequences")}</Typography.Title>
        <ul>
          {sLevelStorePolicy.rewards.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <Typography.Paragraph type="secondary">{sLevelStorePolicy.operatorNote}</Typography.Paragraph>
      </Modal>
      <Modal
        title={t("store_owner_scan_or_enter_fan_qr")}
        open={activityScannerOpen}
        onCancel={() => setActivityScannerOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setActivityScannerOpen(false)}>{t("store_owner_cancel")}</Button>,
          <Button key="verify" type="primary" onClick={handleScannerVerify}>{t("store_owner_verify_visit")}</Button>,
        ]}
        centered
      >
        <Typography.Paragraph>
          {st("Scan support uses the same verification logic as manual fallback. Store users confirm participation only; the system awards points after validation.")}
        </Typography.Paragraph>
        <Input
          autoFocus
          className="so-input-dark"
          value={activityVerifyCode}
          onChange={(event) => setActivityVerifyCode(event.target.value)}
          placeholder={st("Fan QR / Fan ID / email / activity code")}
          onPressEnter={handleScannerVerify}
        />
      </Modal>
    </div>
  );

  const MeTab = () => (
    <div>
      <Card size="small" className="so-card-subtle store-dashboard-section" title={t("store_owner_store_profile")}>
        <div className="store-dashboard-row">
          <div>
            <strong>{store.name}</strong>
            <p>{formatStoreLocation(store)} · {store.phone || st("Phone pending")}</p>
          </div>
          <Tag color={levelBundle.color}>{store.level || "C"} {st("Level")}</Tag>
        </div>
      </Card>

      <section className="store-photo-material-workbench store-premium-section-stack" aria-label="Store photos and materials workbench">
        {storeBottomNavAlerts.me && (
          <ActionNeededStrip
            title={missingRequiredStorePhotos.length > 0 ? st("Upload store photos") : st("Request low materials")}
            status={missingRequiredStorePhotos.length > 0 ? `${missingRequiredStorePhotos.length} ${st("Missing")}` : `${lowBundleStock.length} ${st("low")}`}
            actions={[
              {
                label: missingRequiredStorePhotos.length > 0 ? st("Upload photos") : st("Request materials"),
                primary: true,
                onClick: missingRequiredStorePhotos.length > 0 ? scrollToShowcaseSection : scrollToMaterialSection,
              },
            ]}
          />
        )}
        <Card size="small" className="so-card-subtle store-dashboard-section store-photo-reminder-strip">
          <div>
            <Text strong className="so-text-light">{t("store_owner_store_setup_visibility")}</Text>
          </div>
          <div className="store-photo-reminder-status">
            {missingRequiredStorePhotos.length > 0 ? (
              <Tag color="volcano">{missingRequiredStorePhotos.length} {st("photo tasks missing")}</Tag>
            ) : (
              <Tag color="green">{st("Photos ready for review")}</Tag>
            )}
            <Button size="small" onClick={scrollToShowcaseSection}>{st("Manage photos")}</Button>
          </div>
        </Card>

        <div className="store-me-action-rail">
          <div className="store-me-action-chip">
            <PictureOutlined />
            <strong>{st("Store Front Photo & Display Photos")}</strong>
            {missingRequiredStorePhotos.length > 0 ? (
              <Tag color="volcano">{missingRequiredStorePhotos.length} {st("Missing")}</Tag>
            ) : (
              <Tag color="green">{st("Approved")}</Tag>
            )}
          </div>
          <div className="store-me-action-chip">
            <InboxOutlined />
            <strong>{t('store_materials')}</strong>
            <Tag color="gold">{normalizeRegion(store)}</Tag>
          </div>
        </div>

        <div ref={showcaseSectionRef}>
          <ShowcaseTab />
        </div>
        <div ref={materialSectionRef}>
          <MaterialsTab />
        </div>
      </section>
    </div>
  );

  const tabItems = [
    { key: "home", label: <span><ShopOutlined /> {t("store_owner_tab_home")}</span>, children: <Dashboard /> },
    { key: "verify", label: <span><GiftOutlined /> {t("store_owner_tab_verify")}</span>, children: <RewardPickupTab /> },
    { key: "activities", label: <span><FireOutlined /> {t("store_owner_tab_activities")}</span>, children: <CampaignsTab /> },
    isActiveSStoreAccount && { key: "s-report", label: <span><InboxOutlined /> {t("store_owner_tab_s_report")}</span>, children: <SStoreReportTab /> },
    { key: "me", label: <span><UserOutlined /> {t("store_owner_tab_me")}</span>, children: <MeTab /> },
  ].filter(Boolean);

  const bottomNavItems = [
    { key: "home", label: t("store_owner_tab_home"), Icon: ShopOutlined },
    { key: "verify", label: t("store_owner_tab_verify"), Icon: QrcodeOutlined },
    { key: "activities", label: t("store_owner_tab_activities"), Icon: FireOutlined },
    isActiveSStoreAccount && { key: "s-report", label: t("store_owner_tab_s_report"), Icon: InboxOutlined },
    { key: "me", label: t("store_owner_tab_me"), Icon: UserOutlined },
  ].filter(Boolean);
  const storeBottomNavAlerts = {
    verify: activeStoreCampaigns.length > 0 && activityVerifyRecords.length === 0,
    activities: pendingCampaignClaims.length > 0 || myStoreEvents.some((event) => ["pending", "needs_update", "rejected"].includes(event.review_status || event.approval_status)),
    "s-report": isActiveSStoreAccount && sStoreSellThroughHistory.length + sStoreProductInventoryHistory.length + sStoreMaterialInventoryHistory.length === 0,
    me: missingRequiredStorePhotos.length > 0 || lowBundleStock.length > 0,
  };
  const ActionNeededStrip = ({ title, status, actions }) => (
    <div className="store-action-needed-strip">
      <div className="store-action-needed-copy">
        <span>{st("Action needed")}</span>
        <strong>{title}</strong>
        <Tag color="volcano">{status}</Tag>
      </div>
      <div className="store-action-needed-actions">
        {actions.map((action) => (
          <Button key={action.label} size="small" type={action.primary ? "primary" : "default"} onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="so-page app-liquid-shell store-liquid-shell store-premium-workbench-shell bg-radial-center">
      <div className="app-liquid-bg-scrim" />
      {/* Header */}
      <div className="so-flex-between-mb store-liquid-header liquid-glass">
        <div className="store-header-info">
          <div>
            <h4 className="so-text-gold so-m0 store-owner-title">{t('store_title')}</h4>
            <Text className="so-text-white30 so-fs11">{store.name}</Text>
          </div>
          <div className="store-level-medal" style={{ "--store-level-color": levelBundle.color }}>
            <div className="store-level-medal-icon">
              <LevelIcon />
            </div>
            <div className="store-level-medal-copy">
              <span>{levelBundleLabel}</span>
              <strong>{store.level || "C"}</strong>
            </div>
          </div>
          </div>
          <div className="store-header-actions">
            {store.status === "pending_review" && <Tag color="orange" className="so-fw600">{storeStatusLabel(store.status)}</Tag>}
            <Tag color={levelBundle.color} className="so-fw600"><LevelIcon /> {levelBundleLabel}</Tag>
            <div className="store-settings-slot">
            <button
              type="button"
              className={`store-settings-trigger${settingsOpen ? " is-open" : ""}`}
              onClick={() => setSettingsOpen((value) => !value)}
              aria-label={st("Open store settings")}
            >
              <SettingOutlined />
            </button>
            {settingsOpen && (
              <div className="store-settings-panel liquid-glass">
                <div className="store-settings-label">{t("settings_language")}</div>
                <div className="store-settings-language-list">
                  {storeLanguageOptions.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={`store-settings-lang${lang === item.code ? " is-active" : ""}`}
                      onClick={() => setLang(item.code)}
                    >
                      <GlobalOutlined />
                      <span>{item.label}</span>
                      {lang === item.code && <CheckCircleOutlined />}
                    </button>
                  ))}
                </div>
                <div className="fe-settings-divider" />
                <button type="button" className="store-settings-item" onClick={handleStoreLogout}>
                  <LogoutOutlined /> {t("logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="small"
        className="so-text-light app-liquid-tabs store-owner-content-tabs"
      />

      <nav className={isActiveSStoreAccount ? "store-bottom-nav has-s-report" : "store-bottom-nav"} aria-label="Store owner navigation">
        {bottomNavItems.map(({ key, label, Icon }) => {
          const hasAlert = Boolean(storeBottomNavAlerts[key]);
          return (
          <button
            key={key}
            type="button"
            data-tab-key={key}
            className={`store-bottom-nav-button${activeTab === key ? " is-active" : ""}${hasAlert ? " has-alert" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="store-bottom-nav-icon"><Icon /></span>
            {hasAlert && <span className="store-bottom-nav-dot" aria-hidden="true" />}
            <span>{label}</span>
          </button>
          );
        })}
      </nav>

      {/* Edit Store Modal */}
      <Modal
        title={<span className="so-text-gold"><EditOutlined /> {t('store_edit')}</span>}
        open={editModalOpen}
        forceRender
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSaveStore}
        okText={t('save')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#ffffff", border: "1px solid rgba(82,62,24,0.14)" } }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="name" label={<span className="so-text-light">{t('store_name')}</span>} rules={[{ required: true }]}>
            <Input className="so-input-dark" />
          </Form.Item>
          <Form.Item name="phone" label={<span className="so-text-light">{t('store_phone')}</span>}>
            <Input className="so-input-dark" />
          </Form.Item>
          <Form.Item name="address" label={<span className="so-text-light">{t('store_address')}</span>}>
            <Input.TextArea rows={2} className="so-input-dark" />
          </Form.Item>
          <Form.Item name="contact" label={<span className="so-text-light">{t('contact')}</span>}>
            <Input className="so-input-dark" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span className="so-text-gold"><FireOutlined /> {t("store_owner_apply_store_activity")}</span>}
        open={activityModalOpen}
        forceRender
        onCancel={() => setActivityModalOpen(false)}
        onOk={handleSubmitStoreActivity}
        okText={st("Submit for approval")}
        cancelText={t('cancel')}
        styles={{ content: { background: "#ffffff", border: "1px solid rgba(82,62,24,0.14)" } }}
      >
        <Form form={activityForm} layout="vertical" initialValues={{ points: 0 }}>
          <Form.Item name="title" label={st("Activity title")} rules={[{ required: true, message: st("Please enter activity title") }]}>
            <Input className="so-input-dark" placeholder="G5 tasting weekend" />
          </Form.Item>
          <Form.Item name="description" label={st("Activity content")} rules={[{ required: true, message: st("Please enter activity content") }]}>
            <Input.TextArea rows={3} className="so-input-dark" placeholder={st("Tell fans what happens in store")} />
          </Form.Item>
          <Form.Item name="gift" label={st("Gift or benefit")} rules={[{ required: true, message: st("Please enter gift or benefit") }]}>
            <Input className="so-input-dark" placeholder="UWELL cap / tasting gift / coupon" />
          </Form.Item>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item name="start_date" label={st("Start date")} rules={[{ required: true, message: st("Start date required") }]}>
                <DatePicker format="YYYY-MM-DD" placeholder="YYYY-MM-DD" className="so-input-dark" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="end_date" label={st("End date")} rules={[{ required: true, message: st("End date required") }]}>
                <DatePicker format="YYYY-MM-DD" placeholder="YYYY-MM-DD" className="so-input-dark" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="points"
            label={st("Optional fan points")}
            extra={st("Trial rule: 0 for gift-only events, or {min}-{max} points when requesting UWELL point support.")
              .replace("{min}", operationalRules.storeEventMinPoints)
              .replace("{max}", operationalRules.storeEventMaxPoints)}
            rules={[{
              validator: (_, value) => {
                const points = Number(value || 0);
                if (points === 0) return Promise.resolve();
                if (points < operationalRules.storeEventMinPoints || points > operationalRules.storeEventMaxPoints) {
                  return Promise.reject(new Error(st("Point support must be 0 or {min}-{max}")
                    .replace("{min}", operationalRules.storeEventMinPoints)
                    .replace("{max}", operationalRules.storeEventMaxPoints)));
                }
                return Promise.resolve();
              },
            }]}
          >
            <InputNumber min={0} max={operationalRules.storeEventMaxPoints} className="so-input-dark" style={{ width: "100%" }} />
          </Form.Item>
          <Text type="secondary" className="so-fs11">{st("Fans will see this only after admin approval.")}</Text>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        title={<span className="so-text-green"><CheckCircleOutlined /> {t('review_title')}</span>}
        open={reviewModal.open}
        onCancel={() => setReviewModal({ open: false, claim: null })}
        onOk={handleSubmitReview}
        okText={reviewModal.claim?.status === "completed" ? t('update_review') : t('submit_review')}
        cancelText={t('cancel')}
        styles={{ content: { background: "#ffffff", border: "1px solid rgba(82,62,24,0.14)" } }}
      >
        {reviewModal.claim && (
          <div>
            <Text className="so-text-light so-dblock so-mb12">
              {t('nav_campaigns')}: <strong className="so-table-points">{reviewModal.claim.campaign_name}</strong>
            </Text>

            <div className="so-mb12">
              <Text className="so-text-white50 so-fs12 so-dblock so-mb4">{t('materials_used')}</Text>
              <InputNumber
                min={0}
                value={reviewForm.materials_used}
                onChange={(v) => setReviewForm((p) => ({ ...p, materials_used: v }))}
                className="so-input-dark" style={{ width: "100%" }}
              />
            </div>

            <div className="so-mb12">
              <Text className="so-text-white50 so-fs12 so-dblock so-mb4">{t('effect')}</Text>
              <Select
                value={reviewForm.effect}
                onChange={(v) => setReviewForm((p) => ({ ...p, effect: v }))}
                className="so-minw80" style={{ width: "100%" }}
                options={[
                  { label: t('effect_great'), value: "great" },
                  { label: t('effect_good'), value: "good" },
                  { label: t('effect_average'), value: "average" },
                  { label: t('effect_poor'), value: "poor" },
                ]}
              />
            </div>

            <div>
              <Text className="so-text-white50 so-fs12 so-dblock so-mb4">{t('feedback')}</Text>
              <Input.TextArea
                rows={3}
                value={reviewForm.feedback}
                onChange={(e) => setReviewForm((p) => ({ ...p, feedback: e.target.value }))}
                className="so-input-dark"
                placeholder={t('feedback_placeholder')}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoreOwnerPage;

