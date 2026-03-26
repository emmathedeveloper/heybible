import DesignPaneBackgrounds from "./design-pane/backgrounds"
import { AArrowDownIcon } from "./ui/a-arrow-down"
import { GalleryHorizontalEndIcon } from "./ui/gallery-horizontal-end"
import { SparklesIcon } from "./ui/sparkles"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"


const DesignPane = () => {
    return (
        <div className='size-full p-2'>
            <Tabs defaultValue="backgrounds" className="size-full flex flex-col">
                <TabsList className="w-full">
                    <TabsTrigger value="backgrounds">
                        <GalleryHorizontalEndIcon />
                    </TabsTrigger>
                    <TabsTrigger value="fonts">
                        <AArrowDownIcon />
                    </TabsTrigger>
                    <TabsTrigger value="animations">
                        <SparklesIcon />
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="backgrounds" className="flex-1 overflow-hidden">
                    <DesignPaneBackgrounds />
                </TabsContent>
                <TabsContent value="fonts">

                </TabsContent>
                <TabsContent value="animations">

                </TabsContent>
            </Tabs>
        </div>
    )
}

export default DesignPane