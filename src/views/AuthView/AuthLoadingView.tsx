import { useEffect, useState } from "react"
import toast from "react-hot-toast"
type AuthLoadingViewProps = {
    view: any,
    setView: any
}
const AuthLoadingView = ({ setView }: AuthLoadingViewProps) => {

    const [currentStep, setCurrentStep] = useState("INITIALIZING...")

    const init = async () => {
        const stepHandler = (_: unknown, step: string) => {
            setCurrentStep(step)
        };
        window.ipcRenderer.on("load-license-key:step", stepHandler);
        try {
            const data = await window.ipcRenderer.invoke("load-license-key");
            
            if(!data.valid){
                setView("login")
                toast.error(data.error)
            }else{
                setView("verified")
            }
        }
        finally {
            window.ipcRenderer.off("load-license-key:step", stepHandler);
        }
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <div className='flex flex-col flex-1 items-center justify-center'>
            {currentStep && <p className="animate-pulse">{currentStep.replace(/_/g , " ")}</p>}
        </div>
    )
}
export default AuthLoadingView