import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light tracking-tight mb-4">
          About InkOra
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          InkOra helps you personalize invitations beautifully, at scale.
        </p>
      </div>

      <div className="prose dark:prose-invert mx-auto">
        <h2>What is InkOra?</h2>
        <p>
          InkOra is a premium web application designed to make invitation personalization
          simple, beautiful, and scalable. Upload your invitation design, mark the areas
          you want to customize, and generate hundreds of personalized versions in minutes.
        </p>

        <h2>Features</h2>
        <ul>
          <li>Upload your own invitation designs</li>
          <li>Draw text and color boxes on your template</li>
          <li>Customize fonts, colors, and styles</li>
          <li>Generate single invitations or bulk via CSV</li>
          <li>Download all invitations as a ZIP file</li>
          <li>Works on desktop and mobile</li>
          <li>No installation required - works in your browser</li>
        </ul>

        <h2>How it works</h2>
        <ol>
          <li>Upload your invitation image</li>
          <li>Add text boxes where you want custom text</li>
          <li>Add color boxes to cover existing text</li>
          <li>Customize fonts, sizes, and colors</li>
          <li>Generate invitations manually or upload a CSV for bulk generation</li>
          <li>Download your personalized invitations</li>
        </ol>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          Crafted by Prajyot
        </div>
        <div className="mt-10 pt-7 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500">
          Send feedback or report issues on prajyotm99@gmail.com
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}