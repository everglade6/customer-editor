'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.css';

export default function GirlPage() {
  return (
    <div className={styles.container}>
      {/* Fixed side images */}
      <div className={styles.sideLeft}>
        <Image 
          src="/side.gif" 
          alt="Left side decoration" 
          width={200} 
          height={600}
          className={styles.sideImage}
        />
      </div>
      
      <div className={styles.sideRight}>
        <Image 
          src="/side.gif" 
          alt="Right side decoration" 
          width={200} 
          height={600}
          className={styles.sideImage}
        />
      </div>

      {/* Header with navigation */}
      <div className={styles.header}>
        <div className={styles.headerImageContainer}>
          <Image 
            src="/header.gif" 
            alt="Header decoration" 
            width={400} 
            height={100}
            className={styles.headerImage}
          />
        </div>
        <div className={styles.headerSpacer}></div>
      </div>

      {/* Main content area with numbered images */}
      <div className={styles.content}>
        <div className={styles.imageGrid}>
          <Image 
            src="/1.jpg" 
            alt="Image 1" 
            width={300} 
            height={300}
            className={styles.gridImage}
          />
          <Image 
            src="/2.jpg" 
            alt="Image 2" 
            width={300} 
            height={300}
            className={styles.gridImage}
          />
          <Image 
            src="/3.jpg" 
            alt="Image 3" 
            width={300} 
            height={300}
            className={styles.gridImage}
          />
          <Image 
            src="/4.jpg" 
            alt="Image 4" 
            width={300} 
            height={300}
            className={styles.gridImage}
          />
          <Image 
            src="/5.jpg" 
            alt="Image 5" 
            width={300} 
            height={300}
            className={styles.gridImage}
          />
          <Image 
            src="/6.jpg" 
            alt="Image 6" 
            width={300} 
            height={300}
            className={styles.gridImage}
          />
        </div>
      </div>
    </div>
  );
}
