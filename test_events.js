function getUpcomingEvent(businesses) {
    const today = new Date();
    // check next 7 days
    for (const b of businesses) {
        if (!b.customEvents) continue;
        for (const evt of b.customEvents) {
            if (evt.optOutImages || (evt.personImages && evt.personImages.length > 0)) continue;
            
            // check date
            let evtDate;
            if (evt.date.length === 5) { // MM-DD
                evtDate = new Date(`${today.getFullYear()}-${evt.date}`);
                if (evtDate < today) {
                    evtDate.setFullYear(today.getFullYear() + 1);
                }
            } else {
                evtDate = new Date(evt.date);
                if (evt.isAnnual && evtDate < today) {
                    evtDate.setFullYear(today.getFullYear() + 1);
                }
            }
            
            const diffTime = evtDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays <= 7) {
                return { business: b, event: evt, days: diffDays };
            }
        }
    }
    return null;
}
