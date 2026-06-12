import ResizableRightPanel from '@/components/common/ResizableRightPanel'
import Divider from '@/components/common/Divider'
import QuickInput from '@/components/home/QuickInput'
import TodayTimeline from '@/components/home/TodayTimeline'
import UpcomingDeadlines from '@/components/home/UpcomingDeadlines'
import RecentEntryList from '@/components/home/RecentEntryList'
import HomeRightPanel from '@/components/home/HomeRightPanel'

export default function HomePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex flex-col gap-3 p-3 overflow-auto border-r"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <QuickInput />
          <Divider />
          <TodayTimeline />
          <Divider />
          <UpcomingDeadlines />
          <Divider />
          <RecentEntryList />
        </div>

        <ResizableRightPanel>
          <HomeRightPanel />
        </ResizableRightPanel>
      </div>
    </div>
  )
}
