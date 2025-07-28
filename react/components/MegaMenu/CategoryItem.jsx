// CategoryItem.js

import React, { useState, useRef } from 'react'
import { Link } from 'vtex.render-runtime'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { categoryItemShape } from './propTypes'
import ItemContainer from './ItemContainer'
import styles from './categoryMenu.css'
import categoryMenuPosition, {
  getMenuPositionValues,
} from '../../utils/categoryMenuPosition'
import { getSortSubcategoriesValues } from '../../utils/sortSubcategoriesItems'
import { HamburguerIcon } from '../Icons'

const CategoryItem = ({
  category,
  subcategoryLevels,
  menuPosition,
  category: { name, slug },
  noRedirect,
  isCategorySelected,
  sortSubcategories,
}) => {
  const [isHover, setHover] = useState(false)
  const itemRef = useRef(null)

  const handleCloseMenu = () => {
    setHover(false)
  }

  const categoryClasses = classNames(
    styles.departmentLink,
    'w-100 pv5 no-underline t-small outline-0 db tc link truncate bb bw1 c-muted-1',
    {
      'b--transparent': !isHover && !isCategorySelected,
      'b--action-primary pointer': isHover || isCategorySelected,
      mr8: menuPosition === categoryMenuPosition.DISPLAY_LEFT.value,
      ml8: menuPosition === categoryMenuPosition.DISPLAY_RIGHT.value,
      mh6: menuPosition === categoryMenuPosition.DISPLAY_CENTER.value,
    }
  )

  const containerStyle = {
    top: '100%',
    left: 0,
    right: 0,
    display: isHover ? 'flex' : 'none',
    position: 'absolute',
    zIndex: 10,
  }

  // Subcategorias ordenadas
  const sortedChildren = [...category.children].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <li
      className={`${styles.itemContainer} ${
        styles['itemContainer--department']
      } flex items-center db list${noRedirect ? ` ${styles.allCategories}` : ''}`}
      ref={itemRef}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleCloseMenu}
    >
      {noRedirect ? (
        <strong className={categoryClasses}>
          <span style={{ display: 'none' }}>{name}</span>
          <HamburguerIcon />
          <span>Produtos</span>
        </strong>
      ) : (
        <Link
          onClick={handleCloseMenu}
          page="store.search#department"
          params={{ department: slug }}
          className={categoryClasses}
        >
          {name}
        </Link>
      )}

      {subcategoryLevels > 0 && category.children.length > 0 && (
        <ItemContainer
          menuPosition={menuPosition}
          containerStyle={containerStyle}
          categories={sortedChildren}
          parentSlug={category.slug}
          onCloseMenu={handleCloseMenu}
          showSecondLevel={subcategoryLevels === 2}
          sortSubcategories={sortSubcategories}
        />
      )}
    </li>
  )
}

CategoryItem.propTypes = {
  category: categoryItemShape.isRequired,
  noRedirect: PropTypes.bool,
  subcategoryLevels: PropTypes.oneOf([0, 1, 2]),
  menuPosition: PropTypes.oneOf(getMenuPositionValues()),
  isCategorySelected: PropTypes.bool,
  sortSubcategories: PropTypes.oneOf(getSortSubcategoriesValues),
}

export default CategoryItem
