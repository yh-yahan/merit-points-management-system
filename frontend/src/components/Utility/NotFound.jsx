import { Link } from 'react-router-dom'

function NotFound(){
  return(
    <>
      <div className="m-5 p-5 row">
        <h1 className="col text-center m-3 p-3">This page could not be found!</h1>
        <p className="text-center lead">We are sorry. But the page you are looking for is not available.</p>
        <div className="col text-center m-4">
          <Link to="/" className="lead btn btn-primary">BACK TO HOMEPAGE</Link>
        </div>
      </div>
    </>
  );
}

export default NotFound