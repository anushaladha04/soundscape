export default function Home() {
  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Soundscape</h1>
        <p className="text-lg mb-8 text-light-gray">Welcome to Soundscape - Your Music Community</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-medium-gray p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Your Community</h3>
            <p className="text-light-gray mb-4">View and share concert events with the community</p>
          </div>
          
          <div className="bg-medium-gray p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Submit a Post</h3>
            <p className="text-light-gray mb-4">Share a concert event with the community</p>
          </div>
        </div>
      </div>
    </div>
  );
}

