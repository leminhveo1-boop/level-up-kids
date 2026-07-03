/**
 * i18n dictionaries — VI (default) + EN.
 * Coverage: auth, onboarding, child profiles, premium/paywall, common navigation,
 * and the game-screen chrome (merged from ./game). Game DATA (pet/item/boss names,
 * pet quotes, parent-entered task titles) stays as-is — proper nouns / user data.
 */

import { gameDict } from "./game";

export const dictionaries = {
  vi: {
    ...gameDict.vi,
    // Common
    "common.appName": "Level Up Kids",
    "common.loading": "Đang tải...",
    "common.back": "Quay lại",
    "common.cancel": "Hủy bỏ",
    "common.confirm": "Xác nhận",
    "common.save": "Lưu",
    "common.close": "Đóng",
    "common.error": "Có lỗi xảy ra, vui lòng thử lại!",

    // Nav
    "nav.adventure": "Phiêu Lưu",
    "nav.rewards": "Đổi Quà",
    "nav.mining": "Đào Mỏ",
    "nav.parent": "Bố Mẹ",

    // Auth
    "auth.title": "Tài Khoản Gia Đình",
    "auth.subtitle": "Đăng nhập để đồng bộ tiến trình của con trên mọi thiết bị",
    "auth.email": "Email",
    "auth.password": "Mật khẩu (tối thiểu 6 ký tự)",
    "auth.displayName": "Tên phụ huynh",
    "auth.signIn": "ĐĂNG NHẬP",
    "auth.signUp": "ĐĂNG KÝ MIỄN PHÍ",
    "auth.switchToSignUp": "Chưa có tài khoản? Đăng ký ngay",
    "auth.switchToSignIn": "Đã có tài khoản? Đăng nhập",
    "auth.signOut": "Đăng xuất",
    "auth.checkEmail": "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản. 📧",
    "auth.localMode": "Chơi ngay không cần tài khoản (lưu trên máy này)",
    "auth.error.invalid": "Email hoặc mật khẩu không đúng!",

    // Children profiles
    "children.title": "Chọn Anh Hùng Của Nhà Mình",
    "children.add": "Thêm Anh Hùng Mới ➕",
    "children.limitFree": "Cần gói Premium để tạo hồ sơ cho con (tối đa 6 bé/gia đình).",
    "children.paidOnly": "Tài khoản của bạn đang ở chế độ dùng thử. Mở khóa Premium để tạo hồ sơ thật và lưu tiến trình của con!",
    "children.tryDemo": "🎮 Chơi Thử Bản Demo",

    // Demo mode
    "demo.banner": "Bản dùng thử — không lưu tiến trình",
    "demo.bannerSub": "Mở khóa trọn bộ chỉ 199.000₫/năm",
    "demo.unlock": "Mở khóa",
    "children.play": "VÀO CHƠI 🎮",
    "children.delete": "Xóa hồ sơ",
    "children.deleteConfirm": "Xóa hồ sơ này? Toàn bộ tiến trình của bé sẽ bị mất!",

    // Premium / paywall
    "premium.title": "Nâng Cấp Premium 👑",
    "premium.badge": "PREMIUM",
    "premium.freeBadge": "MIỄN PHÍ",
    "premium.feature.multiChild": "Tối đa 6 hồ sơ con trong 1 gia đình",
    "premium.feature.sync": "Đồng bộ đám mây mọi thiết bị",
    "premium.feature.support": "Hỗ trợ ưu tiên từ đội ngũ phát triển",
    "premium.activeUntil": "Premium đến ngày",
    "premium.enterCode": "Nhập mã kích hoạt",
    "premium.redeem": "KÍCH HOẠT 🗝️",
    "premium.codeSuccess": "Kích hoạt Premium thành công! 🎉",
    "premium.code.CODE_NOT_FOUND": "Mã kích hoạt không tồn tại!",
    "premium.code.CODE_ALREADY_USED": "Mã này đã được sử dụng!",
    "premium.payTitle": "Thanh toán tự động qua chuyển khoản",
    "premium.payDesc": "Chuyển khoản đúng số tiền với nội dung bên dưới, hệ thống sẽ tự động kích hoạt trong ~1 phút (qua SePay).",
    "premium.payContent": "Nội dung chuyển khoản",
    "premium.price": "Giá gói 1 năm",
    "premium.trust.noCard": "Không lưu thẻ — chuyển khoản 1 lần là xong",
    "premium.trust.noAutoCharge": "Không tự động trừ tiền — hết hạn là ngừng, không bẫy gia hạn",

    // Referral (two-sided +6 months)
    "premium.referTitle": "Giới thiệu bạn bè 🎁",
    "premium.referDesc": "Mỗi gia đình bạn giới thiệu nâng cấp thành công: CẢ HAI nhà được tặng thêm 6 tháng Premium!",
    "premium.yourCode": "Mã giới thiệu của bạn",
    "premium.shareBtn": "Chia sẻ lời mời 📤",
    "premium.copied": "Đã sao chép lời mời!",
    "premium.enterReferTitle": "Có mã giới thiệu? 🎟️",
    "premium.enterReferDesc": "Nhập mã của người giới thiệu trước khi thanh toán — cả hai nhà +6 tháng ngay khi bạn nâng cấp.",
    "premium.referPlaceholder": "REFXXXXXX",
    "premium.applyRefer": "ÁP DỤNG",
    "premium.referApplied": "Đã áp dụng mã giới thiệu! Khi bạn nâng cấp Premium, cả hai nhà sẽ được +6 tháng. 🎉",
    "premium.referredBadge": "✓ Đã áp dụng mã giới thiệu — cả hai nhà +6 tháng khi bạn nâng cấp",
    "premium.refer.CODE_NOT_FOUND": "Mã giới thiệu không tồn tại!",
    "premium.refer.ALREADY_REFERRED": "Bạn đã dùng một mã giới thiệu rồi.",
    "premium.refer.SELF_REFERRAL": "Không thể tự giới thiệu chính mình.",
    "premium.refer.INVALID": "Mã giới thiệu chưa đúng định dạng (REF + 6 ký tự).",
  },

  en: {
    ...gameDict.en,
    // Common
    "common.appName": "Level Up Kids",
    "common.loading": "Loading...",
    "common.back": "Back",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.close": "Close",
    "common.error": "Something went wrong, please try again!",

    // Nav
    "nav.adventure": "Adventure",
    "nav.rewards": "Rewards",
    "nav.mining": "Mining",
    "nav.parent": "Parents",

    // Auth
    "auth.title": "Family Account",
    "auth.subtitle": "Sign in to sync your child's progress across devices",
    "auth.email": "Email",
    "auth.password": "Password (min 6 characters)",
    "auth.displayName": "Parent name",
    "auth.signIn": "SIGN IN",
    "auth.signUp": "SIGN UP FREE",
    "auth.switchToSignUp": "No account yet? Sign up",
    "auth.switchToSignIn": "Already have an account? Sign in",
    "auth.signOut": "Sign out",
    "auth.checkEmail": "Signed up! Please check your email to confirm your account. 📧",
    "auth.localMode": "Play now without an account (saved on this device)",
    "auth.error.invalid": "Invalid email or password!",

    // Children profiles
    "children.title": "Choose Your Family Hero",
    "children.add": "Add New Hero ➕",
    "children.limitFree": "Premium is required to create child profiles (up to 6 per family).",
    "children.paidOnly": "Your account is in trial mode. Unlock Premium to create real profiles and save your child's progress!",
    "children.tryDemo": "🎮 Try the Demo",

    // Demo mode
    "demo.banner": "Trial mode — progress is not saved",
    "demo.bannerSub": "Unlock everything for just 199,000₫/year",
    "demo.unlock": "Unlock",
    "children.play": "PLAY 🎮",
    "children.delete": "Delete profile",
    "children.deleteConfirm": "Delete this profile? All of this child's progress will be lost!",

    // Premium / paywall
    "premium.title": "Upgrade to Premium 👑",
    "premium.badge": "PREMIUM",
    "premium.freeBadge": "FREE",
    "premium.feature.multiChild": "Up to 6 child profiles per family",
    "premium.feature.sync": "Cloud sync across all devices",
    "premium.feature.support": "Priority support from our team",
    "premium.activeUntil": "Premium active until",
    "premium.enterCode": "Enter activation code",
    "premium.redeem": "ACTIVATE 🗝️",
    "premium.codeSuccess": "Premium activated successfully! 🎉",
    "premium.code.CODE_NOT_FOUND": "Activation code not found!",
    "premium.code.CODE_ALREADY_USED": "This code has already been used!",
    "premium.payTitle": "Automatic bank-transfer payment",
    "premium.payDesc": "Transfer the exact amount with the content below; your account activates automatically within ~1 minute (via SePay).",
    "premium.payContent": "Transfer content",
    "premium.price": "1-year plan price",
    "premium.trust.noCard": "No card on file — one single transfer and you're done",
    "premium.trust.noAutoCharge": "No auto-charge — access simply stops at expiry, no renewal traps",

    // Referral (two-sided +6 months)
    "premium.referTitle": "Refer a Friend 🎁",
    "premium.referDesc": "For every family you refer who upgrades: BOTH families get an extra 6 months of Premium!",
    "premium.yourCode": "Your referral code",
    "premium.shareBtn": "Share invite 📤",
    "premium.copied": "Invite copied!",
    "premium.enterReferTitle": "Have a referral code? 🎟️",
    "premium.enterReferDesc": "Enter your referrer's code before you pay — both families get +6 months the moment you upgrade.",
    "premium.referPlaceholder": "REFXXXXXX",
    "premium.applyRefer": "APPLY",
    "premium.referApplied": "Referral code applied! When you upgrade to Premium, both families get +6 months. 🎉",
    "premium.referredBadge": "✓ Referral code applied — both families get +6 months when you upgrade",
    "premium.refer.CODE_NOT_FOUND": "Referral code not found!",
    "premium.refer.ALREADY_REFERRED": "You've already used a referral code.",
    "premium.refer.SELF_REFERRAL": "You can't refer yourself.",
    "premium.refer.INVALID": "Referral code format is invalid (REF + 6 characters).",
  },
};

export const SUPPORTED_LOCALES = ["vi", "en"];
export const DEFAULT_LOCALE = "vi";
