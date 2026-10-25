# SeaTime - Seafarer Tracker

PWA work/rest/OT tracker for seafarers. Separate from DrivePH.

**Features:**
- Deck Work, Watch Duty (12-4, 4-8, 8-12, 12-6, 6-12), Standby, Mooring, Bunkering, Provision, Garbage, Cargo, Drills, Other
- Auto calc: Total Work = sum, Rest = 24 - Work
- Arrival & Departure with 🚢🛳️ icons, port stay duration
- True 24H format (00-23 dropdown), live 24H clock
- Rank: Master to Messman (22 ranks) + Dept auto-sync
- Vessel Info: Beijing, Type, IMO, Flag + Master Name separate box
- DMW OT Rules: 40h/week Mon-Fri 8h/day = Regular, beyond 8h = Weekday OT straight, Sat/Sun = OT straight (1×), Holiday Double OT ONLY when Holiday + At Port + Watch Duty (8h→16h)
- Detailed Breakdown: 7 columns Date, Location, Regular, OT, Rest, Day Type, Notes
- DMW 10 Regular Holidays only, red date
- Weekly/Monthly totals, Pay Hours
- Offline PWA, localStorage, Export/Import JSON to sync phone/laptop
- Dark/Light theme

**Run:**
```bash
npm install
npm run dev -- --host
# Local: http://localhost:5173
# Network: http://192.168.43.229:5173