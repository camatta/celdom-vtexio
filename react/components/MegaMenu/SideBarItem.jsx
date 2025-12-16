import React, { useState, Fragment } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { FormattedMessage } from 'react-intl'

import { IconMinus, IconPlus } from 'vtex.store-icons'
import styles from './categoryMenu.css'

const buildHref = linkValues => {
  const parts = linkValues.filter(Boolean)
  return `/${parts.join('/')}`
}

const SideBarItem = ({
  treeLevel = 1,
  item: { children },
  showSubcategories,
  onClose,
  linkValues,
  item,
}) => {
  const [open, setOpen] = useState(false)

  const subCategoriesVisible =
    showSubcategories && children && children.length > 0

  const href = buildHref(linkValues)

  const handleItemClick = () => {
    if (subCategoriesVisible) setOpen(prev => !prev)
  }

  const sideBarContainerClasses = classNames(
    styles.sidebarItemContainer,
    'flex justify-between items-center pointer list ma0'
  )

  const sideBarItemTitleClasses = classNames('', {
    't-body lh-solid': treeLevel === 1,
  })

  const sideBarSpanClasses = classNames(
    treeLevel === 1 ? 'c-on-base' : 'c-muted-3'
  )

  const sideBarItemClasses = classNames(`${styles.sidebarItem} list pa0 ma0`, {
    'c-muted-2 t-body pl4': treeLevel > 1,
    'c-on-base': treeLevel === 1,
  })

  return (
    <ul className={sideBarItemClasses}>
      <li
        className={sideBarContainerClasses}
        onClick={subCategoriesVisible ? handleItemClick : undefined}
      >
        {subCategoriesVisible ? (
          <>
            <span
              className={`${styles.sideBarItemTitleClasses} ${sideBarItemTitleClasses}`}
            >
              {item.name}
            </span>

            <span className={`${styles.sideBarSpanClasses} ${sideBarSpanClasses}`}>
              {open ? <IconMinus size={10} /> : <IconPlus size={10} />}
            </span>
          </>
        ) : (
          <a
            href={href}
            className="flex justify-between items-center w-100 no-underline"
            onClick={onClose}
          >
            <span
              className={`${styles.sideBarItemTitleClasses} ${sideBarItemTitleClasses}`}
            >
              {item.name}
            </span>
          </a>
        )}
      </li>

      {subCategoriesVisible && open && (
        <>
          {[...children]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(child => (
              <li
                key={child.id}
                className={`list ma0 pa0 ${styles.subCategoryContainer}`}
              >
                <SideBarItem
                  showSubcategories={showSubcategories}
                  item={child}
                  linkValues={[...linkValues, child.slug]}
                  onClose={onClose}
                  treeLevel={treeLevel + 1}
                />
              </li>
            ))}

          <li className="list ma0 pa0">
            <a
              href={href}
              className={`${styles.pointerNavigate} pointer t-body c-muted-2 ma0 list pl4 no-underline`}
              onClick={onClose}
            >
              <FormattedMessage id="store/category-menu.all-category.title">
                {txt => <span>{txt}</span>}
              </FormattedMessage>
            </a>
          </li>
        </>
      )}
    </ul>
  )
}

SideBarItem.propTypes = {
  item: PropTypes.object.isRequired,
  linkValues: PropTypes.arrayOf(PropTypes.string).isRequired,
  onClose: PropTypes.func.isRequired,
  treeLevel: PropTypes.number,
  showSubcategories: PropTypes.bool,
}

export default SideBarItem
