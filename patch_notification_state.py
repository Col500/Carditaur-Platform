import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

target = """  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);"""

replacement = """  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [upcomingEventNotification, setUpcomingEventNotification] = useState<{business: Business, event: any, days: number} | null>(null);

  useEffect(() => {
    if (!isAuthenticated || businesses.length === 0) return;
    const today = new Date();
    today.setHours(0,0,0,0);
    let found = null;
    for (const b of businesses) {
        if (!b.customEvents) continue;
        for (const evt of b.customEvents) {
            if (evt.optOutImages || (evt.personImages && evt.personImages.length > 0)) continue;
            
            let evtDateStr = evt.date;
            let evtDate;
            if (evtDateStr.length === 5) {
                evtDate = new Date(`${today.getFullYear()}-${evtDateStr}`);
                evtDate.setHours(0,0,0,0);
                if (evtDate < today) evtDate.setFullYear(today.getFullYear() + 1);
            } else {
                evtDate = new Date(evtDateStr);
                evtDate.setHours(0,0,0,0);
                if (evt.isAnnual && evtDate < today) evtDate.setFullYear(today.getFullYear() + 1);
            }
            const diffDays = Math.ceil((evtDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 7) {
                found = { business: b, event: evt, days: diffDays };
                break;
            }
        }
        if (found) break;
    }
    setUpcomingEventNotification(found);
  }, [businesses, isAuthenticated]);"""

text = text.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)
print("patched state")
