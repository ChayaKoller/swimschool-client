import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="card p-10 text-center">
      <h1 className="text-xl font-bold text-brand">הדף לא נמצא</h1>
      <Link to="/groups" className="btn-primary mt-4">
        חזרה לקבוצות
      </Link>
    </div>
  )
}
