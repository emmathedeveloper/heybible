import { useEffect } from "react"


const AuthLoadingView = () => {

    const init = async () => {

        const stepHandler = (_: unknown, step: string) => {
            console.log(step);
        };

        window.ipcRenderer.on("load-license-key:step", stepHandler);

        try {
            await window.ipcRenderer.invoke("load-license-key");
        } finally {
            window.ipcRenderer.off("load-license-key:step", stepHandler);
        }
    }

    useEffect(() => {
        init()
    }, [])

    return (
        <div className='flex flex-col flex-1'>
            <h1>Loading</h1>
        </div>
    )
}

export default AuthLoadingView