// ItemContainer.js atualizado

import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'vtex.render-runtime'
import { categoryPropType } from './propTypes'
import classNames from 'classnames'
import { Container } from 'vtex.store-components'

import styles from './categoryMenu.css'
import categoryMenuPosition, {
  getMenuPositionValues,
} from '../../utils/categoryMenuPosition'
import sortSubcategoriesItems from '../../utils/sortSubcategoriesItems'

const getLinkParams = (parentSlug, item) => {
  const params = {
    department: parentSlug || item.slug,
  }
  if (parentSlug) params.category = item.slug
  return params
}

const ItemContainer = ({
  containerStyle,
  categories,
  parentSlug,
  menuPosition,
  onCloseMenu,
  showSecondLevel,
  sortSubcategories,
}) => {
  const containerClasses = classNames(
    styles.submenuList,
    'w-100 flex flex-wrap pa0 list mw9',
    {
      'justify-start': menuPosition === categoryMenuPosition.DISPLAY_LEFT.value,
      'justify-end': menuPosition === categoryMenuPosition.DISPLAY_RIGHT.value,
      'justify-center': menuPosition === categoryMenuPosition.DISPLAY_CENTER.value,
    }
  )

  return (
    <div
      className={`${styles.itemContainer} ${styles['itemContainer--category']}`}
      style={containerStyle}
    >
      <Container className={`${styles['section--category']} justify-center w-100 flex`}>
        <ul className={containerClasses}>
          {categories
            .sort((a, b) => {
              if (sortSubcategories === sortSubcategoriesItems.SORT_NAME.value) {
                return a.name.localeCompare(b.name)
              }
              return 0
            })
            .map(category => (
              <li key={category.id} className={styles.firstLevelList}>
                <Link
                  onClick={onCloseMenu}
                  page={parentSlug ? 'store.search#category' : 'store.search#department'}
                  className={styles.firstLevelLink}
                  params={getLinkParams(parentSlug, category)}
                >
                  {category.name}
                </Link>
{showSecondLevel && category.children?.length > 0 && (
  <ul className={styles.secondLevelListContainerVertical}>
    {category.children
      .sort((a, b) => a.name.localeCompare(b.name)) // ordem alfabética
      .slice(0, 4) // apenas os 5 primeiros
      .map(sub => (
        <li key={sub.id} className={styles.secondLevelLinkContainer}>
          <Link
            onClick={onCloseMenu}
            page={parentSlug ? 'store.search#subcategory' : 'store.search#category'}
            className={styles.secondLevelLink}
            params={{
              department: parentSlug || category.slug,
              category: parentSlug ? category.slug : sub.slug,
              subcategory: parentSlug ? sub.slug : undefined,
            }}
          >
            {sub.name}
          </Link>
        </li>
      ))}

    {category.children.length > 5 && (
  <li className={`${styles.secondLevelLinkContainer} ${styles.verMaisContainer}`}>
    <Link
      onClick={onCloseMenu}
      page={parentSlug ? 'store.search#category' : 'store.search#department'}
      className={`${styles.secondLevelLink} ${styles.verMaisLink}`}
      params={{
        department: parentSlug || category.slug,
        category: parentSlug ? category.slug : undefined,
      }}
    >
      Ver mais
    </Link>
  </li>
)}
  </ul>
)}

              </li>
            ))}
        </ul>
      </Container>
    </div>
  )
}

ItemContainer.propTypes = {
  categories: PropTypes.arrayOf(categoryPropType),
  parentSlug: PropTypes.string,
  onCloseMenu: PropTypes.func.isRequired,
  showSecondLevel: PropTypes.bool,
  menuPosition: PropTypes.oneOf(getMenuPositionValues()),
  containerStyle: PropTypes.object,
  sortSubcategories: PropTypes.oneOf([sortSubcategoriesItems.SORT_DEFAULT.value, sortSubcategoriesItems.SORT_NAME.value]),
}

export default ItemContainer;