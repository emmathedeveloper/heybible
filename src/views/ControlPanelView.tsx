import BibleHistoryPane from "@/components/bible-history-pane"
import DesignPane from "@/components/design-pane"
import PreviewBox from "@/components/preview-box"
import RecorderBox from "@/components/recorder-box"
import { SplitPane, Pane } from "react-split-pane"

const ControlPanelView = () => {
    return (
        <div className='size-full'>
            <SplitPane
                dividerClassName="bg-secondary"
                dividerStyle={{ width: '3px' }}
                direction="horizontal"
            >
                <Pane minSize={'300px'} defaultSize={'300px'}>
                    <BibleHistoryPane />
                </Pane>

                <Pane minSize={'600px'}>
                    <SplitPane
                        dividerClassName="bg-secondary"
                        dividerStyle={{ height: '3px' }}
                        direction="vertical"
                    >
                        <Pane minSize={'400px'} defaultSize={'400px'}>
                            <PreviewBox />
                        </Pane>
                        <Pane minSize={'400px'}>
                            <RecorderBox />
                        </Pane>
                    </SplitPane>
                </Pane>

                <Pane minSize={'300px'} defaultSize={'300px'}>
                    <DesignPane />
                </Pane>
            </SplitPane>
        </div>
    )
}

export default ControlPanelView