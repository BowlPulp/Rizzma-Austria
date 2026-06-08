export type DeliveryLocation = {
  address: string;
  source: "manual" | "geolocation";
  latitude?: number;
  longitude?: number;
};

export function getDeviceLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  locale = "en",
): Promise<string> {
  const params = new URLSearchParams({
    format: "json",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
    addressdetails: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
      },
    },
  );

  if (!response.ok) {
    throw new Error("geocode-failed");
  }

  const data = (await response.json()) as { display_name?: string };

  if (data.display_name) {
    return data.display_name;
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
