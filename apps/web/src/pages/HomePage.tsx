import Divider from '@/components/common/Divider'
import QuickInput from '@/components/home/QuickInput'
import TodayTimeline from '@/components/home/TodayTimeline'
import UpcomingDeadlines from '@/components/home/UpcomingDeadlines'
import RecentEntryList from '@/components/home/RecentEntryList'

export default function HomePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-3 px-6 pt-10 pb-4 overflow-auto max-w-5xl mx-auto w-full">
        <QuickInput />
        <Divider />
        <TodayTimeline />
        <Divider />
        <UpcomingDeadlines />
        <Divider />
        <RecentEntryList />
      </div>
    </div>
  )
}
