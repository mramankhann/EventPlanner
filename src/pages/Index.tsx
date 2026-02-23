import { SchedulePanel } from '@/components/schedule/SchedulePanel';
import { Helmet } from 'react-helmet-async';

const Index = () => {
    return (
        <>
            <Helmet>
                <title>Visit Day Schedule | Netlink's Event Planner</title>
                <meta name="description" content="Manage and track your visit day schedule with our intuitive event planner. View activities, update status, and stay organized." />
            </Helmet>

            <div className="min-h-screen bg-background py-8 px-4 md:px-8">
                <SchedulePanel />
            </div>
        </>
    );
};

export default Index;
