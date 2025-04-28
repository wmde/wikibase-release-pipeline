import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import type { ReactNode } from 'react';

import styles from './index.module.css';

function HomepageHeader(): ReactNode {
	const { siteConfig } = useDocusaurusContext();
	return (
		<header className={clsx( 'hero hero--primary', styles.heroBanner )}>
			<div className="container">
				<Heading as="h1" className="hero__title">
					{siteConfig.title}
				</Heading>
				<p className="hero__subtitle">{siteConfig.tagline}</p>
			</div>
		</header>
	);
}

export default function Home(): ReactNode {
	const { siteConfig } = useDocusaurusContext();
	return (
		<Layout
			title={siteConfig.title}
			description="Description will go into a meta tag in <head />"
		>
			<HomepageHeader />
			<main></main>
		</Layout>
	);
}
