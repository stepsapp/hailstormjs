const React = require('react')
import Document from '../components/document.jsx'

export default () => (
    <Document
        title='HailstormJS'
        description='Hailstorm helps you to build static websites which are SEO and multi-language compatible and offers a hassle free environment for developers.'>
        <div className='container mx-auto py-10 px-10'>
            <img src='/images/hailstorm.png' width='64px' className='inline' />
            <h1 className='text-5xl font-bold mb-5 mt-5 text-black'>Hailstorm JS</h1>
            <h2 className='text-2xl mb-5 text-black/50'>A real world static website generator</h2>
            <p className='md:w-1/2 lg:w-1/3 block text-black/30'>
                Hailstorm helps you to build static websites which are SEO and multi-language compatible and offers a hassle free environment for developers.
            </p>
            <div className='pt-5 flex gap-1'>
                <img src='https://img.shields.io/npm/v/@stepsapp/hailstormjs' className='inline' />
                <img src='https://img.shields.io/npm/dm/@stepsapp//hailstormjs' className='inline' />
                <a
                    className='github-button pr-2 inline-block'
                    href='https://github.com/stepsapp/hailstormjs'
                    data-icon='octicon-star'
                    aria-label='Star stepsapp/hailstormjs on GitHub'>
                    Star
                </a>{' '}
                <a
                    className='github-button'
                    href='https://github.com/stepsapp/hailstormjs/archive/HEAD.zip'
                    data-icon='octicon-download'
                    aria-label='Download stepsapp/hailstormjs on GitHub'>
                    Download
                </a>
            </div>

            <div className='mx-auto my-10'>
                <hr />
            </div>
            <h2 className='text-2xl mb-5 font-bold'>What's in it?</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-10'>
                <div className='bg-black/5 p-10 rounded-md'>
                    <h3 className='text-xl mb-3 font-medium'>SEO optimized</h3>
                    <p className='text-sm text-black/50'>Every page is a real HTML file. It's easy for search engines to index your websites.</p>
                </div>
                <div className='bg-black/5 p-10 rounded-md'>
                    <h3 className='text-xl mb-3 font-medium'>Internationalization</h3>
                    <p className='text-sm text-black/50'>
                        Make your website available in multiple languages and generate a unique expirience for your visitors.
                    </p>
                </div>
                <div className='bg-black/5 p-10 rounded-md'>
                    <h3 className='text-xl mb-3 font-medium'>Hot Module Replacement</h3>
                    <p className='text-sm text-black/50'>Develop your project hassle-free. Change something in code will reload everything immediately.</p>
                </div>
                <div className='bg-black/5 p-10 rounded-md'>
                    <h3 className='text-xl mb-3 font-medium'>React</h3>
                    <p className='text-sm text-black/50'>
                        Use the power of react to build your website and reuse components instead of building it over and over.
                    </p>
                </div>
                <div className='bg-black/5 p-10 rounded-md'>
                    <h3 className='text-xl mb-3 font-medium'>Tailwind CSS</h3>
                    <p className='text-sm text-black/50'>A utility-first CSS framework that can be composed to build any design, directly in your markup.</p>
                </div>
                <div className='bg-black/5 p-10 rounded-md'>
                    <h3 className='text-xl mb-3 font-medium'>Firebase friendly</h3>
                    <p className='text-sm text-black/50'>
                        Use all the great features firebase hosting offers.{' '}
                        <a href='https://firebase.google.com/docs/hosting/i18n-rewrites' className='underline hover:cursor-pointer' rel='' target='_blank'>
                            Full Internationalization Support
                        </a>
                    </p>
                </div>
            </div>
            <div className='mx-auto my-10'>
                <hr />
            </div>
            <h2 className='text-2xl mb-5 font-bold'>Getting started</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-2 gap-10'>
                <div>
                    <div className='mb-10'>
                        <h3 className='text-xl mb-3'>Installation</h3>
                        <p className='text-sm text-black/50 mb-3'>
                            1. Make sure you have installed the lastest version of{' '}
                            <a href='https://nodejs.org/' rel='' target='_blank' className='underline hover:cursor-pointer'>
                                nodejs
                            </a>{' '}
                            or at least version 16. Then install hailstormjs via commandline in your project root.
                        </p>
                        <div className='bg-black/5 p-5 rounded-md text-sm'>
                            <code>$ npm i @stepsapp/hailstormjs</code>
                        </div>
                        <p className='text-sm text-black/50 mb-3 mt-5'>2. Initialise everything hailstorm needs</p>
                        <div className='bg-black/5 p-5 rounded-md text-sm'>
                            <code>$ npx exec hailstorm init</code>
                        </div>
                        <p className='text-sm text-black/50 mb-3 mt-5'>3. Start your development environment</p>
                        <div className='bg-black/5 p-5 rounded-md text-sm'>
                            <code>$ npx exec hailstorm start</code>
                        </div>
                    </div>
                </div>
                <div>
                    <div className='rounded-tl-lg rounded-tr-lg bg-black/5 mx-auto' style={{ maxWidth: '540px' }}>
                        <div className='px-2'>
                            <span className='rounded-full inline-block my-2 mx-1' style={{ width: '12px', height: '12px', backgroundColor: '#e74c3c' }}></span>
                            <span className='rounded-full inline-block my-2 mx-1' style={{ width: '12px', height: '12px', backgroundColor: '#f1c40f' }}></span>
                            <span className='rounded-full inline-block my-2 mx-1' style={{ width: '12px', height: '12px', backgroundColor: '#2ecc71' }}></span>
                        </div>
                        <video width='100%' autoPlay loop controls>
                            <source src='/images/install.mp4' type='video/mp4' />
                        </video>
                    </div>
                </div>
            </div>
            <div className='mx-auto my-10'>
                <hr />
            </div>
            <div className='text-sm'>
                Made with ❤️{' '}
                <a href='https://steps.app' className='underline hover:cursor-pointer'>
                    @stepsapp
                </a>
            </div>
        </div>
    </Document>
)
