const Footer = () => {
  return (
    <footer className="py-6 px-4 mt-auto bg-gray-100">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-sm text-gray-600">
          {'Copyright © '}
          <a href="#" className="text-primary-600 hover:text-primary-800">
            Parking Management System
          </a>{' '}
          {new Date().getFullYear()}
          {'.'}
        </p>
        <p className="text-sm text-gray-600 mt-2">
          AI-Powered Vehicle Detection | Edge Computing | Real-time Updates
        </p>
      </div>
    </footer>
  );
};

export default Footer; 