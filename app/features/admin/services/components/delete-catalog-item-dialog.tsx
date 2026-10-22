import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { careCatalogKeys, removeCatalog } from '~/entities/care-catalog/care-catalog-api'
import type { CatalogItemRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { catalogFormError } from '../hooks/use-catalog-item-form'

const key = 'admin.servicesPage.deleteDialog' as const

type DeleteCatalogItemDialogProps = {
  item: CatalogItemRecord
  onClose: () => void
}

export function DeleteCatalogItemDialog({ item, onClose }: DeleteCatalogItemDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const queryClient = useQueryClient()
  const remove = useMutation({
    mutationFn: () => removeCatalog(item.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: careCatalogKeys.all })
      onClose()
    }
  })

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-on-surface/50 p-4'
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !remove.isPending) onClose()
      }}
      role='presentation'
    >
      <section
        aria-labelledby={titleId}
        aria-modal='true'
        className='w-full max-w-md rounded-xl bg-white p-6 shadow-xl'
        role='alertdialog'
      >
        <div className='flex items-start gap-3'>
          <Icon className='rounded-full bg-error-container/60 p-2 text-2xl text-error' name='delete' />
          <div>
            <h2 className='text-lg font-bold' id={titleId}>
              {t(`${key}.title`)}
            </h2>
            <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.body`, { name: item.name })}</p>
          </div>
        </div>
        {remove.isError ? (
          <p className='mt-4 rounded-lg bg-error-container/40 p-3 text-sm text-error' role='alert'>
            {t(`${key}.errors.${catalogFormError(remove.error)}`)}
          </p>
        ) : null}
        <div className='mt-6 flex justify-end gap-2'>
          <button
            autoFocus
            className='rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold'
            disabled={remove.isPending}
            onClick={onClose}
            type='button'
          >
            {t(`${key}.cancel`)}
          </button>
          <button
            className='rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
            type='button'
          >
            {remove.isPending ? t(`${key}.deleting`) : t(`${key}.confirm`)}
          </button>
        </div>
      </section>
    </div>
  )
}
