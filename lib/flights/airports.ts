export interface AirportRecord {
  code: string;
  city: string;
  cityCode: string;
  name: string;
  country: string;
  metroGroup: string;
  lat: number;
  lon: number;
}

export interface LocationSuggestion {
  id: string;
  value: string;
  code: string;
  type: "city" | "airport";
  primaryLabel: string;
  secondaryLabel: string;
  matchText: string;
}

export const AIRPORTS: Record<string, AirportRecord> = {
  JFK: {
    code: "JFK",
    city: "New York",
    cityCode: "NYC",
    name: "John F. Kennedy International",
    country: "United States",
    metroGroup: "NYC",
    lat: 40.6413,
    lon: -73.7781
  },
  EWR: {
    code: "EWR",
    city: "Newark",
    cityCode: "NYC",
    name: "Newark Liberty International",
    country: "United States",
    metroGroup: "NYC",
    lat: 40.6895,
    lon: -74.1745
  },
  LGA: {
    code: "LGA",
    city: "New York",
    cityCode: "NYC",
    name: "LaGuardia",
    country: "United States",
    metroGroup: "NYC",
    lat: 40.7769,
    lon: -73.874
  },
  LHR: {
    code: "LHR",
    city: "London",
    cityCode: "LON",
    name: "Heathrow",
    country: "United Kingdom",
    metroGroup: "LON",
    lat: 51.47,
    lon: -0.4543
  },
  LGW: {
    code: "LGW",
    city: "London",
    cityCode: "LON",
    name: "Gatwick",
    country: "United Kingdom",
    metroGroup: "LON",
    lat: 51.1537,
    lon: -0.1821
  },
  LCY: {
    code: "LCY",
    city: "London",
    cityCode: "LON",
    name: "London City",
    country: "United Kingdom",
    metroGroup: "LON",
    lat: 51.5053,
    lon: 0.0553
  },
  BER: {
    code: "BER",
    city: "Berlin",
    cityCode: "BER",
    name: "Berlin Brandenburg",
    country: "Germany",
    metroGroup: "BER",
    lat: 52.3667,
    lon: 13.5033
  },
  FRA: {
    code: "FRA",
    city: "Frankfurt",
    cityCode: "FRA",
    name: "Frankfurt Airport",
    country: "Germany",
    metroGroup: "FRA",
    lat: 50.0379,
    lon: 8.5622
  },
  MUC: {
    code: "MUC",
    city: "Munich",
    cityCode: "MUC",
    name: "Munich Airport",
    country: "Germany",
    metroGroup: "MUC",
    lat: 48.3538,
    lon: 11.7861
  },
  AMS: {
    code: "AMS",
    city: "Amsterdam",
    cityCode: "AMS",
    name: "Amsterdam Schiphol",
    country: "Netherlands",
    metroGroup: "AMS",
    lat: 52.31,
    lon: 4.7683
  },
  CDG: {
    code: "CDG",
    city: "Paris",
    cityCode: "PAR",
    name: "Charles de Gaulle",
    country: "France",
    metroGroup: "PAR",
    lat: 49.0097,
    lon: 2.5479
  },
  ORY: {
    code: "ORY",
    city: "Paris",
    cityCode: "PAR",
    name: "Paris Orly",
    country: "France",
    metroGroup: "PAR",
    lat: 48.7262,
    lon: 2.3652
  },
  BCN: {
    code: "BCN",
    city: "Barcelona",
    cityCode: "BCN",
    name: "Barcelona-El Prat",
    country: "Spain",
    metroGroup: "BCN",
    lat: 41.2974,
    lon: 2.0833
  },
  MAD: {
    code: "MAD",
    city: "Madrid",
    cityCode: "MAD",
    name: "Adolfo Suarez Madrid-Barajas",
    country: "Spain",
    metroGroup: "MAD",
    lat: 40.4893,
    lon: -3.5676
  },
  FCO: {
    code: "FCO",
    city: "Rome",
    cityCode: "ROM",
    name: "Leonardo da Vinci Fiumicino",
    country: "Italy",
    metroGroup: "ROM",
    lat: 41.7999,
    lon: 12.2462
  },
  LIS: {
    code: "LIS",
    city: "Lisbon",
    cityCode: "LIS",
    name: "Humberto Delgado",
    country: "Portugal",
    metroGroup: "LIS",
    lat: 38.7742,
    lon: -9.1342
  },
  ZRH: {
    code: "ZRH",
    city: "Zurich",
    cityCode: "ZRH",
    name: "Zurich Airport",
    country: "Switzerland",
    metroGroup: "ZRH",
    lat: 47.4581,
    lon: 8.5555
  },
  DUB: {
    code: "DUB",
    city: "Dublin",
    cityCode: "DUB",
    name: "Dublin Airport",
    country: "Ireland",
    metroGroup: "DUB",
    lat: 53.4273,
    lon: -6.2436
  },
  DXB: {
    code: "DXB",
    city: "Dubai",
    cityCode: "DXB",
    name: "Dubai International",
    country: "United Arab Emirates",
    metroGroup: "DXB",
    lat: 25.2532,
    lon: 55.3657
  },
  SIN: {
    code: "SIN",
    city: "Singapore",
    cityCode: "SIN",
    name: "Singapore Changi",
    country: "Singapore",
    metroGroup: "SIN",
    lat: 1.3644,
    lon: 103.9915
  },
  HND: {
    code: "HND",
    city: "Tokyo",
    cityCode: "TYO",
    name: "Tokyo Haneda",
    country: "Japan",
    metroGroup: "TYO",
    lat: 35.5494,
    lon: 139.7798
  },
  NRT: {
    code: "NRT",
    city: "Tokyo",
    cityCode: "TYO",
    name: "Narita International",
    country: "Japan",
    metroGroup: "TYO",
    lat: 35.772,
    lon: 140.3929
  }
};

export const METRO_GROUPS: Record<string, string[]> = {
  NYC: ["JFK", "EWR", "LGA"],
  LON: ["LHR", "LGW", "LCY"],
  PAR: ["CDG", "ORY"],
  TYO: ["HND", "NRT"],
  ROM: ["FCO"]
};

export const POPULAR_AIRPORT_CODES = [
  "JFK",
  "EWR",
  "LHR",
  "LGW",
  "BER",
  "FRA",
  "AMS",
  "CDG",
  "MAD",
  "DXB"
];

function normalizeLocationText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function canonicalCodeForAirport(airport: AirportRecord) {
  return METRO_GROUPS[airport.metroGroup] ? airport.metroGroup : airport.code;
}

function extractCodeFromSuggestion(input: string) {
  const match = input.trim().match(/\(([A-Za-z]{3})\)\s*$/);
  return match?.[1]?.toUpperCase();
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function uniqueBy<T>(values: T[], getKey: (value: T) => string) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = getKey(value);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export const LOCATION_INPUT_SUGGESTIONS = [
  ...unique(
    Object.values(AIRPORTS).map((airport) => {
      const canonicalCode = canonicalCodeForAirport(airport);
      return `${airport.city} (${canonicalCode})`;
    })
  ),
  ...Object.values(AIRPORTS).map(
    (airport) => `${airport.city} - ${airport.name} (${airport.code})`
  )
].sort();

export const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  ...uniqueBy(
    Object.values(AIRPORTS).map((airport) => {
      const canonicalCode = canonicalCodeForAirport(airport);
      const metroAirports = METRO_GROUPS[canonicalCode] ?? [airport.code];
      const isCitySuggestion = metroAirports.length > 1 || canonicalCode === airport.cityCode;

      return {
        id: `city-${canonicalCode}`,
        value: `${airport.city} (${canonicalCode})`,
        code: canonicalCode,
        type: "city" as const,
        primaryLabel: airport.city,
        secondaryLabel: isCitySuggestion
          ? `${canonicalCode} · ${metroAirports.length} airports`
          : `${canonicalCode} · ${airport.country}`,
        matchText: `${airport.city} ${airport.name} ${canonicalCode} ${airport.code} ${airport.country}`
      } satisfies LocationSuggestion;
    }),
    (suggestion) => suggestion.id
  ),
  ...Object.values(AIRPORTS).map((airport) => ({
    id: `airport-${airport.code}`,
    value: `${airport.city} - ${airport.name} (${airport.code})`,
    code: airport.code,
    type: "airport" as const,
    primaryLabel: airport.name,
    secondaryLabel: `${airport.city} · ${airport.code}`,
    matchText: `${airport.city} ${airport.name} ${airport.code} ${airport.country}`
  }))
];

export function lookupAirport(code: string) {
  return AIRPORTS[code.toUpperCase()];
}

export function resolveLocationInput(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const suggestedCode = extractCodeFromSuggestion(trimmed);

  if (suggestedCode) {
    if (METRO_GROUPS[suggestedCode]) {
      return suggestedCode;
    }

    const airport = lookupAirport(suggestedCode);
    return airport ? canonicalCodeForAirport(airport) : suggestedCode;
  }

  const uppercase = trimmed.toUpperCase();

  if (METRO_GROUPS[uppercase]) {
    return uppercase;
  }

  const exactAirport = lookupAirport(uppercase);

  if (exactAirport) {
    return exactAirport.code;
  }

  const normalizedQuery = normalizeLocationText(trimmed);
  const airports = Object.values(AIRPORTS);

  const exactCityMatches = airports.filter(
    (airport) => normalizeLocationText(airport.city) === normalizedQuery
  );

  if (exactCityMatches.length > 0) {
    const cityNames = unique(exactCityMatches.map((airport) => airport.city));

    if (cityNames.length === 1 && exactCityMatches.length === 1) {
      return exactCityMatches[0].code;
    }

    return canonicalCodeForAirport(exactCityMatches[0]);
  }

  const exactAirportNameMatch = airports.find(
    (airport) => normalizeLocationText(airport.name) === normalizedQuery
  );

  if (exactAirportNameMatch) {
    return exactAirportNameMatch.code;
  }

  const startsWithCityMatch = airports.find((airport) =>
    normalizeLocationText(airport.city).startsWith(normalizedQuery)
  );

  if (startsWithCityMatch) {
    return canonicalCodeForAirport(startsWithCityMatch);
  }

  const startsWithAirportNameMatch = airports.find((airport) =>
    normalizeLocationText(airport.name).startsWith(normalizedQuery)
  );

  if (startsWithAirportNameMatch) {
    return startsWithAirportNameMatch.code;
  }

  const containsCityMatch = airports.find((airport) =>
    normalizeLocationText(airport.city).includes(normalizedQuery)
  );

  if (containsCityMatch) {
    return canonicalCodeForAirport(containsCityMatch);
  }

  const containsAirportNameMatch = airports.find((airport) =>
    normalizeLocationText(airport.name).includes(normalizedQuery)
  );

  if (containsAirportNameMatch) {
    return containsAirportNameMatch.code;
  }

  return uppercase;
}

export function findLocationSuggestions(query: string, limit = 7) {
  const trimmed = query.trim();

  if (!trimmed) {
    const popularCitySuggestions = LOCATION_SUGGESTIONS.filter(
      (suggestion) =>
        suggestion.type === "city" &&
        POPULAR_AIRPORT_CODES.includes(suggestion.code) === false
    ).slice(0, 4);
    const popularAirportSuggestions = LOCATION_SUGGESTIONS.filter(
      (suggestion) =>
        suggestion.type === "airport" && POPULAR_AIRPORT_CODES.includes(suggestion.code)
    ).slice(0, 3);

    return [...popularCitySuggestions, ...popularAirportSuggestions].slice(0, limit);
  }

  const normalizedQuery = normalizeLocationText(trimmed);

  return [...LOCATION_SUGGESTIONS]
    .map((suggestion) => {
      const normalizedMatchText = normalizeLocationText(suggestion.matchText);
      const normalizedPrimary = normalizeLocationText(suggestion.primaryLabel);
      const normalizedSecondary = normalizeLocationText(suggestion.secondaryLabel);
      let score = 0;

      if (normalizeLocationText(suggestion.code) === normalizedQuery) {
        score += 120;
      }

      if (normalizedPrimary === normalizedQuery) {
        score += 100;
      }

      if (normalizedPrimary.startsWith(normalizedQuery)) {
        score += 70;
      }

      if (normalizedSecondary.startsWith(normalizedQuery)) {
        score += 40;
      }

      if (normalizedMatchText.includes(normalizedQuery)) {
        score += 30;
      }

      if (suggestion.type === "city") {
        score += 8;
      }

      return {
        suggestion,
        score
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.suggestion);
}

export function resolveNearbyAirports(code: string) {
  const normalized = resolveLocationInput(code);

  if (METRO_GROUPS[normalized]) {
    return METRO_GROUPS[normalized];
  }

  const airport = lookupAirport(normalized);

  if (!airport) {
    return [normalized];
  }

  return METRO_GROUPS[airport.metroGroup] ?? [airport.code];
}

export function getAirportLabel(code: string) {
  const airport = lookupAirport(code);

  if (!airport) {
    return code.toUpperCase();
  }

  return `${airport.code} · ${airport.city}`;
}

export function calculateDistanceKm(fromCode: string, toCode: string) {
  const from = lookupAirport(fromCode);
  const to = lookupAirport(toCode);

  if (!from || !to) {
    return 2500;
  }

  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
