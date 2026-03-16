
const ControlPanelView = () => {

  const startAI = () => {
    window.ipcRenderer.send('start-ai-session')
  }

  return (
    <div>
        <button onClick={startAI}>
            Start AI
        </button>
    </div>
  )
}

export default ControlPanelView