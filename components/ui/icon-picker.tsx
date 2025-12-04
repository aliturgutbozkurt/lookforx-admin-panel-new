'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Check } from 'lucide-react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import { IconType } from 'react-icons';

interface IconPickerProps {
    value?: string;
    onChange: (iconName: string) => void;
}

// E-commerce and Service specific icon categories
const CATEGORY_ICONS = {
    shopping: [
        'FaShoppingCart', 'FaShoppingBag', 'FaShoppingBasket', 'FaStore', 'FaStoreAlt',
        'MdShoppingCart', 'MdShoppingBag', 'MdLocalMall', 'MdStorefront', 'MdStore',
        'BsCart', 'BsCart2', 'BsCart3', 'BsCart4', 'BsCartFill', 'BsBag', 'BsBagFill'
    ],
    electronics: [
        'FaLaptop', 'FaMobile', 'FaTablet', 'FaDesktop', 'FaKeyboard', 'FaMouse', 'FaHeadphones',
        'FaTv', 'FaCamera', 'FaVideo', 'FaMicrophone', 'FaGamepad',
        'MdComputer', 'MdLaptop', 'MdPhoneIphone', 'MdTablet', 'MdHeadphones', 'MdCamera',
        'BiLaptop', 'BiMobile', 'BiDesktop', 'BiHeadphone', 'BiCamera'
    ],
    fashion: [
        'FaTshirt', 'FaShoePrints', 'FaGlasses', 'FaHatCowboy', 'FaUserTie',
        'MdCheckroom', 'BsHandbag', 'BsWatch', 'BsSunglasses'
    ],
    food: [
        'FaUtensils', 'FaCoffee', 'FaPizzaSlice', 'FaHamburger', 'FaWineGlass', 'FaBeer',
        'FaAppleAlt', 'FaCarrot', 'FaIceCream', 'FaCookie',
        'MdRestaurant', 'MdFastfood', 'MdLocalCafe', 'MdLocalPizza', 'MdLocalBar',
        'BiCoffee', 'BiFoodMenu', 'BiFoodTag'
    ],
    home: [
        'FaHome', 'FaCouch', 'FaBed', 'FaChair', 'FaToilet', 'FaBath', 'FaLightbulb',
        'MdHome', 'MdBed', 'MdChair', 'MdKitchen', 'MdLocalLaundryService',
        'BiHome', 'BsHouse', 'BsLamp'
    ],
    sports: [
        'FaFootballBall', 'FaBasketballBall', 'FaTableTennis', 'FaSwimmer', 'FaRunning',
        'FaBicycle', 'FaDumbbell', 'FaTrophy', 'FaMedal',
        'MdSportsSoccer', 'MdSportsBasketball', 'MdFitnessCenter', 'MdPool'
    ],
    books: [
        'FaBook', 'FaBookOpen', 'FaBookReader', 'FaGraduationCap', 'FaPencilAlt',
        'MdBook', 'MdMenuBook', 'MdSchool', 'BiBook', 'BsBook', 'BsJournalText'
    ],
    health: [
        'FaHeartbeat', 'FaHospital', 'FaAmbulance', 'FaNotesMedical', 'FaPills',
        'FaStethoscope', 'FaSyringe', 'FaBandAid',
        'MdLocalHospital', 'MdMedicalServices', 'MdHealthAndSafety', 'BiHealth'
    ],
    services: [
        'FaTools', 'FaWrench', 'FaHammer', 'FaScrewdriver', 'FaCog', 'FaPaintRoller',
        'FaCarCrash', 'FaOilCan', 'FaPlug', 'FaBolt',
        'MdBuild', 'MdConstruction', 'MdHandyman', 'MdPlumbing', 'MdElectricalServices',
        'BiWrench', 'BsTools', 'BsGear'
    ],
    beauty: [
        'FaCut', 'FaSpa', 'FaPumpSoap', 'FaMagic',
        'MdSpa', 'MdFace', 'BsScissors'
    ],
    automotive: [
        'FaCar', 'FaCarSide', 'FaTruck', 'FaMotorcycle', 'FaBus', 'FaTaxi',
        'MdDirectionsCar', 'MdDirectionsBus', 'MdTwoWheeler', 'BiCar'
    ],
    entertainment: [
        'FaMusic', 'FaFilm', 'FaTheaterMasks', 'FaDice', 'FaPuzzlePiece',
        'FaGuitar', 'FaDrum', 'FaMicrophoneAlt',
        'MdMovie', 'MdMusicNote', 'MdTheaters', 'BiMoviePlay'
    ],
    pets: [
        'FaDog', 'FaCat', 'FaPaw', 'FaFish', 'FaHorse',
        'MdPets'
    ],
    business: [
        'FaBriefcase', 'FaFileAlt', 'FaClipboard', 'FaChartLine', 'FaChartBar',
        'FaHandshake', 'FaMoneyBillWave', 'FaCreditCard',
        'MdBusiness', 'MdWork', 'MdAttachMoney', 'BiMoney', 'BsBriefcase'
    ]
};

// Combine all icon libraries
const ALL_ICONS = { ...FaIcons, ...MdIcons, ...BiIcons, ...BsIcons };

export default function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const getIconsForTab = () => {
        if (activeTab === 'all') {
            return Object.keys(ALL_ICONS).filter(name => !name.includes('Context'));
        }
        return CATEGORY_ICONS[activeTab as keyof typeof CATEGORY_ICONS] || [];
    };

    const allIcons = getIconsForTab();
    const filteredIcons = searchQuery
        ? allIcons.filter(name =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allIcons;

    const IconComponent = value && ALL_ICONS[value as keyof typeof ALL_ICONS] as IconType;

    return (
        <div>
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(true)}
                className="w-full justify-start text-left font-normal"
            >
                <div className="flex items-center">
                    {IconComponent ? (
                        <>
                            <IconComponent className="mr-2 h-4 w-4" />
                            <span>{value}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">Select an icon...</span>
                    )}
                </div>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh]">
                    <DialogHeader>
                        <DialogTitle>Select Icon</DialogTitle>
                        <DialogDescription>
                            Choose from 5,000+ icons across multiple categories
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search icons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid grid-cols-8 w-full">
                                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                <TabsTrigger value="shopping" className="text-xs">Shopping</TabsTrigger>
                                <TabsTrigger value="electronics" className="text-xs">Tech</TabsTrigger>
                                <TabsTrigger value="fashion" className="text-xs">Fashion</TabsTrigger>
                                <TabsTrigger value="food" className="text-xs">Food</TabsTrigger>
                                <TabsTrigger value="services" className="text-xs">Services</TabsTrigger>
                                <TabsTrigger value="health" className="text-xs">Health</TabsTrigger>
                                <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
                            </TabsList>

                            <TabsContent value={activeTab} className="mt-4">
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="grid grid-cols-10 gap-2">
                                        {filteredIcons.slice(0, 500).map((iconName) => {
                                            const Icon = ALL_ICONS[iconName as keyof typeof ALL_ICONS] as IconType;
                                            const isSelected = value === iconName;

                                            if (!Icon) return null;

                                            return (
                                                <button
                                                    key={iconName}
                                                    type="button"
                                                    onClick={() => {
                                                        onChange(iconName);
                                                        setOpen(false);
                                                    }}
                                                    className={`
                                                        relative p-3 rounded-lg border-2 transition-all
                                                        hover:bg-accent hover:border-primary
                                                        ${isSelected
                                                            ? 'border-primary bg-accent'
                                                            : 'border-transparent'
                                                        }
                                                    `}
                                                    title={iconName}
                                                >
                                                    <Icon className="h-5 w-5 mx-auto" />
                                                    {isSelected && (
                                                        <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {filteredIcons.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            No icons found matching "{searchQuery}"
                                        </div>
                                    )}
                                </ScrollArea>

                                <div className="text-sm text-muted-foreground text-center mt-4">
                                    {searchQuery ? (
                                        <p>Found {filteredIcons.length} icons (showing first 500)</p>
                                    ) : (
                                        <p>Showing {Math.min(filteredIcons.length, 500)} of {filteredIcons.length} icons</p>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
