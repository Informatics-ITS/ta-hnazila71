import styles from './footer.module.css';

export default function Footer() {
    const user = {
        name: 'John Doe',
    };

    return(
        <div className={styles.footer}>
            <p>Copyright © 2023 <span>KINDERFIN</span>, All rigths Reserved</p>
        </div>
    );
}