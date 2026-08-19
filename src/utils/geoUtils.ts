import { Workshop, UserLocation } from "../types";

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

/**
 * Estimates driving time in minutes based on distance
 */
export function estimateDriveTimeMinutes(distanceKm: number): number {
  if (distanceKm <= 5) return Math.max(3, Math.round(distanceKm * 2.2));
  if (distanceKm <= 20) return Math.round(distanceKm * 1.5);
  if (distanceKm <= 100) return Math.round(distanceKm * 1.1);
  return Math.round((distanceKm / 85) * 60);
}

/**
 * Computes live distance & ETA for a list of workshops given a user coordinate
 */
export function getWorkshopsSortedByDistance(
  workshops: Workshop[],
  userLocation: UserLocation
): Workshop[] {
  return workshops
    .map((w) => {
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, w.lat, w.lng);
      const eta = estimateDriveTimeMinutes(dist);
      return {
        ...w,
        distanceKm: dist,
        driveTimeMin: eta,
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
