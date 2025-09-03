 

import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <img
          src="/wordart.png"
          alt="Customer Manager"
          className={styles.logoImage}
        />
      </div>

      <div className={styles.panel}>
        <marquee behavior="alternate" scrollamount="6" className={styles.marquee}>
          Welcome to the Customer Manager!
        </marquee>
        <hr className={styles.separator} />

        <div className={styles.content}>
          <p className={styles.lead}>
            Totally radical 90s interface. Use the buttons below to explore.
          </p>
          <div className={styles.buttons}>
            <a href="#" className={`${styles.button} ${styles.buttonAdd}`}>
              Add Customer
            </a>
            <a href="#" className={`${styles.button} ${styles.buttonView}`}>
              View Customers
            </a>
            <a href="#" className={`${styles.button} ${styles.buttonAbout}`}>
              About
            </a>
          </div>
        </div>

        <hr className={styles.separator} />
        <p className={styles.tip}>
          Tip: This page uses a glorious 90s aesthetic with WordArt vibes, gradients,
          and a marquee. Swap the links for real pages when ready.
        </p>
      </div>
    </div>
  );
}
