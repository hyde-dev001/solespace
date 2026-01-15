import React from 'react';

const PageBreadcrumb = ({ pageTitle, breadcrumbs = [] }) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-bold text-black dark:text-white">
        {pageTitle}
      </h2>
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={index}>
              <a href={breadcrumb.href} className="text-sm text-meta-9">
                {breadcrumb.label}
              </a>
              {index < breadcrumbs.length - 1 && (
                <span className="text-sm text-meta-9">/</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
    </div>
  );
};

export default PageBreadcrumb;
