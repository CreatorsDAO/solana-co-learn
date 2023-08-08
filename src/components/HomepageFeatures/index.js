import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Solana CookBook Zh',
    Svg: require('@site/static/img/easter-island-svgrepo-com.svg').default,
    description: (
      <>
        📖Solana CookBook 中文翻译版本
      </>
    ),
  },
  // {
  //   title: 'Solana的开发指南',
  //   Svg: require('@site/static/img/parthenon-svgrepo-com.svg').default,
  //   description: (
  //     <>
  //       🧭Solana的开发指南
  //     </>
  //   ),
  // },
  {
    title: 'Solana Co Learn',
    Svg: require('@site/static/img/my_logo.svg').default,
    description: (
      <>
        💾Solana 共学学习资料
      </>
    ),
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
