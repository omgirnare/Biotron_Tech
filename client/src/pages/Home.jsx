import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                A calm, secure way to manage your medical records
              </h1>
              <p className="mt-3 text-slate-600">
                Upload, organize, and share access with your doctor when needed. Your data, your control.
              </p>
              <div className="mt-6 flex gap-3">
                <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700">Get started</Link>
                <Link to="/login" className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50">Sign in</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="prose prose-slate">
                <h3>How it works</h3>
                <ol>
                  <li>Create a patient or doctor account</li>
                  <li>Patients upload their medical records</li>
                  <li>Patients grant access to doctors as needed</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


