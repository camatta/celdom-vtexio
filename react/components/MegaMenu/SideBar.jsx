import React, { Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Animation } from 'vtex.store-components'

import SideBarItem from './SideBarItem'
import styles from './categoryMenu.css'

const OPEN_SIDEBAR_CLASS = styles.sidebarOpen

const SideBar = ({
  title = 'Departments',
  visible,
  onClose = () => {},
  showSubcategories,
  departments = [],
  CustomComponent,
  children,
}) => {
  useEffect(() => {
    if (visible) {
      document.body.classList.add(OPEN_SIDEBAR_CLASS)

      return () => document.body.classList.remove(OPEN_SIDEBAR_CLASS)
    } else {
      document.body.classList.remove(OPEN_SIDEBAR_CLASS)
    }
  }, [visible])

  const scrimClasses = classNames(
    styles.sidebarScrim,
    'fixed dim bg-base--inverted top-0 z-1 vw-100 vh-100 o-40',
    {
      dn: !visible,
    }
  )

  return (
    <Fragment>
      <div className={scrimClasses} onClick={onClose} />
      <Animation
        isActive={visible}
        type="drawerRight"
        className={`${styles.animation} fixed w-80 top-0 z-max`}
      >
        <aside
          className={`${styles.sidebar} w-100 bg-base z-max vh-100 shadow-5 overflow-scroll`}
        >
          <div className={styles.sidebarHeader}>
            {CustomComponent && <CustomComponent />}

            <div
              className={`${styles.iconContainer} pointer`}
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="14"
                fill="none"
                viewBox="0 0 15 14"
              >
                <path
                  stroke="#EA5A1C"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                  d="M1.783 12.732l11.06-11.088M12.863 12.732L1.803 1.644"
                ></path>
              </svg>
            </div>
          </div>

          <ul className={`${styles.sidebarContent} list`}>
{departments
  .sort((a, b) => a.name.localeCompare(b.name))
  .map(department => (
    <li
      key={department.id}
      className={`${styles.sidebarDepartment} list`}
    >
      <SideBarItem
        item={department}
        linkValues={[department.slug]}
        onClose={onClose}
        showSubcategories={showSubcategories}
      />
    </li>
))}
          </ul>

          {children && children}
        </aside>
      </Animation>
    </Fragment>
  )
}

SideBar.propTypes = {
  /** Sidebar's departments. */
  departments: PropTypes.arrayOf(PropTypes.object),
  /** Closes sidebar. */
  onClose: PropTypes.func,
  /** Sidebar's visibility. */
  visible: PropTypes.bool,
  /** Whether to show subcategories or not */
  showSubcategories: PropTypes.bool,
}

export default SideBar