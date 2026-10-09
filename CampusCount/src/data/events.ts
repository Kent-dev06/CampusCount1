export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  kind: string;
  color: string;
  attending: number;
  latitude: number;
  longitude: number;
  radius: number;
};

export const initialEvents: EventItem[] = [
  {
    id: "event-001",
    title: "Campus Clean-up Drive",
    date: "2026-10-04",
    time: "8:00 AM",
    place: "Main Quadrangle",
    kind: "COMMUNITY",
    color: "#DDF3E8",
    attending: 86,
    latitude: 7.4479,
    longitude: 125.8072,
    radius: 100,
  },
  {
    id: "event-002",
    title: "Student Leaders Assembly",
    date: "2026-10-08",
    time: "1:30 PM",
    place: "Auditorium",
    kind: "CAMPUS",
    color: "#E7E8FF",
    attending: 124,
    latitude: 7.4479,
    longitude: 125.8072,
    radius: 100,
  },
  {
    id: "event-003",
    title: "Tech Week 2026",
    date: "2026-10-12",
    time: "9:00 AM",
    place: "Engineering Hall",
    kind: "ACADEMIC",
    color: "#FFF0D8",
    attending: 203,
    latitude: 7.4479,
    longitude: 125.8072,
    radius: 100,
  },
];
