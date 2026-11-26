// Set de íconos del sitio de cliente: wrappers finos sobre lucide-react.
// Se mantienen los mismos nombres y la misma firma ({ className }) de antes
// para no tener que tocar los archivos que ya los importan.
import {
  AlertTriangle,
  ArrowRight,
  Bed,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Crosshair,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Hotel,
  IdCard,
  Lightbulb,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  User,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from 'lucide-react'

function wrap(LucideIcon) {
  function WrappedIcon({ className = '' }) {
    return <LucideIcon className={className} aria-hidden="true" />
  }
  return WrappedIcon
}

export const ArrowRightIcon = wrap(ArrowRight)
export const AlertIcon = wrap(AlertTriangle)
export const BedIcon = wrap(Bed)
export const BuildingIcon = wrap(Building2)
export const CalendarIcon = wrap(Calendar)
export const CheckIcon = wrap(Check)
export const ChevronDownIcon = wrap(ChevronDown)
export const ChevronLeftIcon = wrap(ChevronLeft)
export const ChevronRightIcon = wrap(ChevronRight)
export const ClockIcon = wrap(Clock)
export const CloseIcon = wrap(X)
export const CoffeeIcon = wrap(Coffee)
export const CreditCardIcon = wrap(CreditCard)
export const CrosshairIcon = wrap(Crosshair)
export const DownloadIcon = wrap(Download)
export const EyeIcon = wrap(Eye)
export const EyeOffIcon = wrap(EyeOff)
export const HotelIcon = wrap(Hotel)
export const IdIcon = wrap(IdCard)
export const LightbulbIcon = wrap(Lightbulb)
export const LockIcon = wrap(Lock)
export const LogoutIcon = wrap(LogOut)
export const MailIcon = wrap(Mail)
export const MapPinIcon = wrap(MapPin)
export const MenuIcon = wrap(Menu)
export const MinusIcon = wrap(Minus)
export const PauseIcon = wrap(Pause)
export const PencilIcon = wrap(Pencil)
export const PhoneIcon = wrap(Phone)
export const PlayIcon = wrap(Play)
export const PlusIcon = wrap(Plus)
export const ReceiptIcon = wrap(Receipt)
export const SearchIcon = wrap(Search)
export const ShieldIcon = wrap(ShieldCheck)
export const SmartphoneIcon = wrap(Smartphone)
export const SparklesIcon = wrap(Sparkles)
export const StarIcon = wrap(Star)
export const TagIcon = wrap(Tag)
export const UserIcon = wrap(User)
export const UsersIcon = wrap(Users)
export const VolumeIcon = wrap(Volume2)
export const VolumeOffIcon = wrap(VolumeX)
export const WifiIcon = wrap(Wifi)
