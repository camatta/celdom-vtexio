import PropTypes from 'prop-types'
import React, { Fragment, useState } from 'react'
import { graphql } from 'react-apollo'
import { injectIntl, intlShape } from 'react-intl'
import { IconMenu } from 'vtex.store-icons'
import { useRuntime } from 'vtex.render-runtime'
import { compose, path } from 'ramda'
import classNames from 'classnames'

import { Container } from 'vtex.store-components'
import CategoryItem from './CategoryItem'
import SideBar from './SideBar'
import { categoryPropType } from './propTypes'
import getCategories from '../../queries/categoriesQuery.gql'

import styles from './categoryMenu.css'
import categoryMenuPosition, {
  getMenuPositionNames,
  getMenuPositionValues,
} from '../../utils/categoryMenuPosition'
import sortSubcategoriesItems, {
  getSortSubcategoriesNames,
  getSortSubcategoriesValues,
} from '../../utils/sortSubcategoriesItems'

const DEFAULT_SUBCATEGORIES_LEVELS = 1

/**
 * Component that represents the menu containing the categories of the store
 */
const MegaMenu = ({
  mobileMode = false,
  showAllDepartments = true,
  showSubcategories = true,
  menuPosition = categoryMenuPosition.DISPLAY_CENTER.value,
  sortSubcategories = sortSubcategoriesItems.SORT_DEFAULT.value,
  departments = [],
  data: { categories = [] },
  intl,
  CustomComponent,
  children,
}) => {
  const runtime = useRuntime()
  const [sideBarVisible, setSidebarVisible] = useState(false)

  const handleSidebarToggle = () => {
    setSidebarVisible(prevVisible => !prevVisible)
  }

  // normaliza para string para evitar mismatch "2" vs 2
const departmentsIds = (departments || []).map(d => String(d.id))

// pega só os que você listou E na ordem que você definiu
const departmentsSelected = (categories || [])
  .filter(cat => departmentsIds.includes(String(cat.id)))
  .sort((a, b) => {
    return departmentsIds.indexOf(String(a.id)) - departmentsIds.indexOf(String(b.id))
  })

// se você passou departments, usa só eles; se não passou, cai na lista completa
const visibleDepartments =
  (departmentsIds.length ? departmentsSelected : categories) || []


  if (mobileMode) {
    return (
      <div className={`${styles.sidebarContainer} ${styles.mobile}`}>
        <SideBar
          visible={sideBarVisible}
          title={intl.formatMessage({
            id: 'store/category-menu.departments.title',
          })}
          departments={visibleDepartments}
          onClose={handleSidebarToggle}
          showSubcategories={showSubcategories}
          CustomComponent={CustomComponent}
          children={children}
        />
        <div className="flex pointer" onClick={handleSidebarToggle}>
          <IconMenu size={24} />
        </div>
      </div>
    )
  }

  const pathName = path(['route', 'params', 'department'], runtime)

  const department = pathName ? pathName : ''

  const desktopClasses = classNames(styles.container)

  return (
    <nav className={desktopClasses}>
      <Container className={`${styles['section--department']}`}>
        <ul
          className={`${styles.departmentList} pa0 list ma0 flex flex-wrap flex-row t-action`}
        >
          {visibleDepartments.map(category => (
            <Fragment key={category.id}>
              <CategoryItem
                menuPosition={menuPosition}
                category={category}
                subcategoryLevels={
                  DEFAULT_SUBCATEGORIES_LEVELS + showSubcategories
                }
                isCategorySelected={department === category.slug}
                sortSubcategories={sortSubcategories}
              />
            </Fragment>
          ))}

          {showAllDepartments && (
            <CategoryItem
              noRedirect
              menuPosition={menuPosition}
              subcategoryLevels={
                DEFAULT_SUBCATEGORIES_LEVELS + showSubcategories
              }
              sortSubcategories={sortSubcategories}
              category={{
                children: categories,
                name: intl.formatMessage({
                  id: 'store/category-menu.departments.title',
                }),
              }}
            />
          )}
        </ul>
      </Container>
    </nav>
  )
}

MegaMenu.propTypes = {
  /** Categories query data */
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    categories: PropTypes.arrayOf(categoryPropType),
  }),
  /** Set mobile mode */
  mobileMode: PropTypes.bool,
  /** Whether to show the departments category or not */
  showAllDepartments: PropTypes.bool,
  /** Whether to show subcategories or not */
  showSubcategories: PropTypes.bool,
  /** Defines the position of the category menu */
  menuPosition: PropTypes.oneOf(getMenuPositionValues()),
  /** Intl */
  intl: intlShape,
  /** Departments to be shown in the desktop mode. */
  departments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
    })
  ),
  sortSubcategories: PropTypes.oneOf(getSortSubcategoriesValues()),
}

MegaMenu.schema = {
  title: 'admin/editor.category-menu.title',
  description: 'admin/editor.category-menu.description',
  type: 'object',
  properties: {
    showAllDepartments: {
      type: 'boolean',
      title: 'admin/editor.category-menu.show-departments-category.title',
      default: true,
    },
    menuPosition: {
      title: 'admin/editor.category-menu.disposition-type.title',
      type: 'string',
      enum: getMenuPositionValues(),
      enumNames: getMenuPositionNames(),
      default: categoryMenuPosition.DISPLAY_CENTER.value,
      isLayout: true,
    },
    showSubcategories: {
      type: 'boolean',
      title: 'admin/editor.category-menu.show-subcategories.title',
      default: true,
    },
    sortSubcategories: {
      title: 'admin/editor.category-menu.sort-subcategories.title',
      type: 'string',
      enum: getSortSubcategoriesValues(),
      enumNames: getSortSubcategoriesNames(),
      default: sortSubcategoriesItems.SORT_DEFAULT.value,
    },
    departments: {
      title: 'store/category-menu.departments.title',
      type: 'array',
      minItems: 0,
      items: {
        title: 'admin/editor.category-menu.departments.items.title',
        type: 'object',
        properties: {
          id: {
            title: 'admin/editor.category-menu.departments.items.id',
            type: 'number',
          },
        },
      },
    },
  },
}

export default compose(graphql(getCategories), injectIntl)(MegaMenu)
