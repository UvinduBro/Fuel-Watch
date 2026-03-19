export type Locale = "en" | "si" | "ta";

export const dictionaries: Record<Locale, Record<string, string>> = {
  en: {
    // Header & Navigation
    "app.title": "Fuel Watch",
    "app.subtitle": "Real-time crowdsourced fuel availability",
    "nav.walletPass": "Wallet Pass",
    "nav.fuelSchedule": "Fuel Schedule",
    "nav.allStations": "All Stations",

    // Filter Bar
    "filter.yourLocation": "Your Location",
    "filter.searching": "Searching",
    "filter.typeCity": "Type city (e.g., Kandy) and press Enter...",
    "filter.openOnly": "Open Only",
    "filter.allStations": "All Stations",
    "filter.filter": "Filter",

    // Fuel Types
    "fuel.petrol92": "Petrol 92",
    "fuel.petrol95": "Petrol 95",
    "fuel.diesel": "Diesel",
    "fuel.superDiesel": "Super Diesel",
    "fuel.all": "All",
    "fuel.petrol": "Petrol",

    // Availability
    "availability.all": "All Availability",
    "availability.available": "Available",
    "availability.lowStock": "Low Stock",
    "availability.outOfStock": "Out of Stock",
    "availability.noData": "No Data Available",

    // Station Card
    "station.nearest": "NEAREST",
    "station.kmAway": "km away",
    "station.islandWide": "Island-Wide",
    "station.openNow": "Open now",
    "station.closed": "Closed",
    "station.details": "Details",
    "station.navigate": "Navigate",
    "station.peopleUpdated": "people updated this shed",
    "station.noData": "No Data",

    // Station Detail Page
    "station.back": "Back",
    "station.getDirections": "Get Directions",
    "station.fuelAvailability": "Fuel Availability",
    "station.queueStatus": "Queue Status",
    "station.currentQueue": "Current Queue",
    "station.updateFuel": "Update Fuel Availability",
    "station.updateQueue": "Update Queue Status",
    "station.fuelType": "Fuel Type",
    "station.selectQueue": "Select Queue Condition",
    "station.submitUpdate": "Submit Update",
    "station.updateQueueBtn": "Update Queue",
    "station.thanksFuel": "Thank you! Your fuel update aids the community.",
    "station.thanksQueue": "Thanks for keeping the queue updated!",
    "station.noFuelUpdates": "No fuel status updates in DB yet for this station.",

    // Queue
    "queue.none": "No Queue",
    "queue.medium": "Medium",
    "queue.long": "Long Queue",
    "queue.unknown": "Unknown",

    // Map / Loading
    "map.initializing": "Initializing Map...",
    "map.acquiring": "Acquiring position...",
    "map.error": "Error loading maps. Check your API key.",
    "map.loading": "Loading Google Maps...",

    // Home
    "home.nearbyStations": "Nearby Stations",
    "home.found": "found",
    "home.noStations": "No stations found matching your criteria.",

    // Banner
    "banner.si": "ඉන්ධන තත්ත්වය ජනතාව විසින් වාර්තා කරනු ලබන අතර මෑත කාලීන තත්ත්වය වෙනස් විය හැකිය.",
    "banner.en": "Fuel status is updated by the public and reflects recent user reports, though availability can change.",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",

    // Language
    "lang.en": "English",
    "lang.si": "සිංහල",
    "lang.ta": "தமிழ்",
  },

  si: {
    // Header
    "app.title": "ඉන්ධන මුරකරු",
    "app.subtitle": "තත්‍ය-කාලීන ජන-මූලික ඉන්ධන ලබාගත හැකි බව",
    "nav.walletPass": "පසුම්බි පාස්",
    "nav.fuelSchedule": "ඉන්ධන කාලසටහන",
    "nav.allStations": "සියලු ස්ථාන",

    // Filter
    "filter.yourLocation": "ඔබේ ස්ථානය",
    "filter.searching": "සොයමින්",
    "filter.typeCity": "නගරය ලියන්න (උදා: මහනුවර) සහ Enter ඔබන්න...",
    "filter.openOnly": "විවෘත පමණි",
    "filter.allStations": "සියලු ස්ථාන",
    "filter.filter": "පෙරහන",

    // Fuel Types
    "fuel.petrol92": "පෙට්‍රල් 92",
    "fuel.petrol95": "පෙට්‍රල් 95",
    "fuel.diesel": "ඩීසල්",
    "fuel.superDiesel": "සුපිරි ඩීසල්",
    "fuel.all": "සියල්ල",
    "fuel.petrol": "පෙට්‍රල්",

    // Availability
    "availability.all": "සියලු ලබාගත හැකි බව",
    "availability.available": "ලබාගත හැක",
    "availability.lowStock": "අඩු තොග",
    "availability.outOfStock": "අවසන්",
    "availability.noData": "දත්ත නොමැත",

    // Station Card
    "station.nearest": "ළඟම",
    "station.kmAway": "km ඈතින්",
    "station.islandWide": "දිවයින පුරා",
    "station.openNow": "දැන් විවෘතයි",
    "station.closed": "වසා ඇත",
    "station.details": "විස්තර",
    "station.navigate": "මාර්ගය",
    "station.peopleUpdated": "දෙනෙකු යාවත්කාලීන කළා",
    "station.noData": "දත්ත නොමැත",

    // Station Detail
    "station.back": "ආපසු",
    "station.getDirections": "දිශාව ලබාගන්න",
    "station.fuelAvailability": "ඉන්ධන ලබාගත හැකි බව",
    "station.queueStatus": "පෝලිම් තත්ත්වය",
    "station.currentQueue": "වර්තමාන පෝලිම",
    "station.updateFuel": "ඉන්ධන ලබාගත හැකි බව යාවත්කාලීන",
    "station.updateQueue": "පෝලිම් තත්ත්වය යාවත්කාලීන",
    "station.fuelType": "ඉන්ධන වර්ගය",
    "station.selectQueue": "පෝලිමේ තත්ත්වය තෝරන්න",
    "station.submitUpdate": "යාවත්කාලීන ඉදිරිපත් කරන්න",
    "station.updateQueueBtn": "පෝලිම යාවත්කාලීන",
    "station.thanksFuel": "ස්තූතියි! ඔබේ යාවත්කාලීනය ප්‍රජාවට උපකාර කරයි.",
    "station.thanksQueue": "පෝලිම යාවත්කාලීන කිරීමට ස්තූතියි!",
    "station.noFuelUpdates": "මෙම ස්ථානය සඳහා තවම ඉන්ධන තත්ත්ව යාවත්කාලීනයන් නොමැත.",

    // Queue
    "queue.none": "පෝලිමක් නැත",
    "queue.medium": "මධ්‍යම",
    "queue.long": "දිගු පෝලිම",
    "queue.unknown": "නොදනී",

    // Map
    "map.initializing": "සිතියම ආරම්භ කරමින්...",
    "map.acquiring": "ස්ථානය ලබාගනිමින්...",
    "map.error": "සිතියම් පූරණ දෝෂයකි.",
    "map.loading": "Google Maps පූරණය වෙමින්...",

    // Home
    "home.nearbyStations": "ආසන්න ස්ථාන",
    "home.found": "හමුවිය",
    "home.noStations": "ඔබගේ නිර්ණායක වලට ගැළපෙන ස්ථාන නොමැත.",

    // Banner
    "banner.si": "ඉන්ධන තත්ත්වය ජනතාව විසින් වාර්තා කරනු ලබන අතර මෑත කාලීන තත්ත්වය වෙනස් විය හැකිය.",
    "banner.en": "ඉන්ධන තත්ත්වය ජනතාව විසින් යාවත්කාලීන කරනු ලැබේ.",

    "theme.light": "එළිය",
    "theme.dark": "අඳුර",
    "theme.system": "පද්ධතිය",
    "lang.en": "English",
    "lang.si": "සිංහල",
    "lang.ta": "தமிழ்",
  },

  ta: {
    // Header
    "app.title": "எரிபொருள் கண்காணிப்பு",
    "app.subtitle": "நிகழ்நேர கூட்டு எரிபொருள் கிடைக்கும் நிலை",
    "nav.walletPass": "பணப்பை பாஸ்",
    "nav.fuelSchedule": "எரிபொருள் அட்டவணை",
    "nav.allStations": "அனைத்து நிலையங்கள்",

    // Filter
    "filter.yourLocation": "உங்கள் இருப்பிடம்",
    "filter.searching": "தேடுகிறது",
    "filter.typeCity": "நகரத்தை உள்ளிடுங்கள் (எ.கா., கண்டி) Enter அழுத்தவும்...",
    "filter.openOnly": "திறந்தவை மட்டும்",
    "filter.allStations": "அனைத்து நிலையங்கள்",
    "filter.filter": "வடிப்பான்",

    // Fuel Types
    "fuel.petrol92": "பெட்ரோல் 92",
    "fuel.petrol95": "பெட்ரோல் 95",
    "fuel.diesel": "டீசல்",
    "fuel.superDiesel": "சூப்பர் டீசல்",
    "fuel.all": "அனைத்தும்",
    "fuel.petrol": "பெட்ரோல்",

    // Availability
    "availability.all": "அனைத்து கிடைக்கும் நிலை",
    "availability.available": "கிடைக்கிறது",
    "availability.lowStock": "குறைந்த இருப்பு",
    "availability.outOfStock": "தீர்ந்தது",
    "availability.noData": "தரவு இல்லை",

    // Station Card
    "station.nearest": "அருகில்",
    "station.kmAway": "km தொலைவில்",
    "station.islandWide": "தீவு முழுவதும்",
    "station.openNow": "இப்போது திறந்துள்ளது",
    "station.closed": "மூடப்பட்டது",
    "station.details": "விவரங்கள்",
    "station.navigate": "வழிகாட்டு",
    "station.peopleUpdated": "பேர் புதுப்பித்தனர்",
    "station.noData": "தரவு இல்லை",

    // Station Detail
    "station.back": "பின்",
    "station.getDirections": "வழிகளைப் பெறுங்கள்",
    "station.fuelAvailability": "எரிபொருள் கிடைக்கும் நிலை",
    "station.queueStatus": "வரிசை நிலை",
    "station.currentQueue": "தற்போதைய வரிசை",
    "station.updateFuel": "எரிபொருள் கிடைக்கும் நிலையை புதுப்பிக்கவும்",
    "station.updateQueue": "வரிசை நிலையை புதுப்பிக்கவும்",
    "station.fuelType": "எரிபொருள் வகை",
    "station.selectQueue": "வரிசை நிலையைத் தேர்ந்தெடுக்கவும்",
    "station.submitUpdate": "புதுப்பிப்பை சமர்ப்பிக்கவும்",
    "station.updateQueueBtn": "வரிசையை புதுப்பி",
    "station.thanksFuel": "நன்றி! உங்கள் புதுப்பிப்பு சமூகத்திற்கு உதவுகிறது.",
    "station.thanksQueue": "வரிசையை புதுப்பிப்பதற்கு நன்றி!",
    "station.noFuelUpdates": "இந்த நிலையத்திற்கு இன்னும் எரிபொருள் நிலை புதுப்பிப்புகள் இல்லை.",

    // Queue
    "queue.none": "வரிசை இல்லை",
    "queue.medium": "நடுத்தரம்",
    "queue.long": "நீண்ட வரிசை",
    "queue.unknown": "தெரியாது",

    // Map
    "map.initializing": "வரைபடத்தை துவக்குகிறது...",
    "map.acquiring": "நிலையை பெறுகிறது...",
    "map.error": "வரைபடங்கள் ஏற்றுவதில் பிழை.",
    "map.loading": "Google Maps ஏற்றுகிறது...",

    // Home
    "home.nearbyStations": "அருகிலுள்ள நிலையங்கள்",
    "home.found": "கண்டுபிடிக்கப்பட்டது",
    "home.noStations": "உங்கள் தேடல் அளவுகோல்களுக்கு பொருந்தும் நிலையங்கள் இல்லை.",

    // Banner
    "banner.si": "எரிபொருள் நிலை மக்களால் புதுப்பிக்கப்படுகிறது.",
    "banner.en": "எரிபொருள் நிலை பொதுமக்களால் புதுப்பிக்கப்படுகிறது, ஆனால் கிடைக்கும் நிலை மாறலாம்.",

    "theme.light": "ஒளி",
    "theme.dark": "இருள்",
    "theme.system": "கணினி",
    "lang.en": "English",
    "lang.si": "සිංහල",
    "lang.ta": "தமிழ்",
  },
};
