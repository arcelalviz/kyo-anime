export default function Loading() {
  return <div className="loading-screen" role="status" aria-label="Loading KIROKU anime archive">
    <div className="loading-ring" aria-hidden="true"><span/></div>
    <span>THE ARCHIVE IS OPENING</span>
    <h2>KIROKU</h2>
    <div className="loading-beam" aria-hidden="true"><span/></div>
    <p>FINDING YOUR NEXT STORY</p>
  </div>;
}
