import { People, Place, Camera } from "@mui/icons-material"

export const iconTypes = {
    social: <People/>,
    place: <Place/>,
    smokement: <Camera/>
}

export const placeholderQuest = {
        id : 'loading',
        title: 'loading',
        icon: iconTypes.place,
        desc: 'loading',
        category: 'loading',
        reward: {
            smokeDollars: 0,
        }
}

export async function getGoldenHour() {
    try {
        const response = await fetch(
            "https://api.sunrisesunset.io/json?lat=38.907192&lng=-77.036873&elevation=0&time_format=24"
        );

        if (!response.ok) {
            throw new Error("Golden Hour konnte nicht geladen werden");
        }

        const data = await response.json();
        return data.results.golden_hour.split(":");
    } catch (error) {
        console.error("Fehler beim Laden der Golden Hour:", error);
        return null;
    }
}


export const quests =
[
    {
        id : "tv_tower",
        title: "Fernsehturm",
        icon: iconTypes.place,
        desc: "Rauche eine am Berliner Fernsehturm. Du musst indestens in einem umkreis von 300m sein damit die Quest gewertet wird.",
        category: "place",
        condition: {
            lat: 52.520804,
            lng: 13.409406,
        },
        reward: {
            smokeDollars: 15,
        }
    },
    {
        id : "visit_friends",
        title: "Guter Freund",
        icon: iconTypes.social,
        desc: "Besuche 3 Profile von Freunden. Verschicke drei Freundschaftanfragen und schaue dir ihre Profile an nachdem sie dich angenommen haben.",
        category: "social",
        type: "FRIEND_PROFILE_VISITED",
        unique: true,
        target: 3,
        reward: {
            smokeDollars: 2,
        }
    },
    {
        id : "first_smokeMent",
        title: "Momentefänger",
        icon: iconTypes.social,
        desc: "Nimm ein Smokement auf und teile ihn mit deinen Freunden.",
        category: "smokement",
        target: 1,
        type: "SMOKEMENT_CAPTURED",
        reward: {
            smokeDollars: 5,
        }
    },
    {
        id : "golden_hour_smokeMent",
        title: "Goldene Stunde",
        icon: iconTypes.social,
        desc: "Nimm ein Smokement zur Goldenen Stunde auf und teile ihn mit deinen Freunden.",
        category: "smokement",
        target: 1,
        type: "SMOKEMENT_CAPTURED",
        reward: {
            smokeDollars: 5,
        }
    },
    {
        id : "brandenburg_gate",
        title: "Brandenburger Tor",
        icon: iconTypes.place,
        desc: "Rauche eine am Brandenburger Tor. Du musst indestens in einem umkreis von 300m sein damit die Quest gewertet wird.",
        category: "place",
        condition: {
            lat: 52.516214,
            lng: 13.377722,
        },
        reward: {
            smokeDollars: 1,
        }
    },
]