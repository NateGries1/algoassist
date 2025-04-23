import { GlobeAmericasIcon, ChatBubbleLeftEllipsisIcon, CodeBracketSquareIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'

const features = [
  {
    name: 'Real-World Problems.',
    description:
      'Practice coding problems sourced from actual interviews, simulating the pressure of real-world technical challenges.',
    icon: GlobeAmericasIcon,
  },
  {
    name: 'Personalized Feedback.',
    description: ' Receive custom feedback to identify areas for improvement and build confidence for upcoming interviews.',
    icon: ChatBubbleLeftEllipsisIcon,
  },
  {
    name: 'Confidence for Every Interview.',
    description: ' Bridge the gap between theory and practice with a platform that helps you prepare, whether you are new to interviews or a seasoned pro.',
    icon: CodeBracketSquareIcon,
  },
]

export default function Features() {
  return (
    <div className="overflow-hidden pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-purple-500">Boost Your Interview Skills</h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                Smarter Interview Prep
              </p>
              <p className="mt-6 text-lg/8 text-gray-400">
                AlgoAssist is a web platform designed to help users prepare for technical interviews through AI-powered simulations. Improve problem-solving and interview skills with realistic challenges and tailored feedback.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-500 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-200">
                      <feature.icon aria-hidden="true" className="absolute top-1 left-1 size-5 text-indigo-600" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <Image
            alt="Product screenshot"
            src="/Features-Picture.png"
            width={2432}
            height={1442}
            className="mt-20 w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  )
}
