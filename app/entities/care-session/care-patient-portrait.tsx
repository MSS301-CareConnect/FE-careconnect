import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import type { CareRecordPatient } from './care-record-preview'

const portraits: Partial<Record<CareRecordPatient, string>> = {
  a: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCarnGiLfiaxQs6H4tb_8pgLpocKevgDXn6u3xViDkQ5Z1mN0K14SFGr41FB265c1m0A4nVf1VR-xn83gT6Dp4ZMCCrsOTXI4PthM3r0ho--1deOgG5YKnBx3uN6fj4Ee6_hzv1LdCC7L43Kw_ywnUHTTzeqj-BzNwTnH3A7JMEVvgpcMCXlBxCYiMmh4hfsbpk4P0KQbR4iG225iGz_BgcAMr99Vq5uO9dLDQgc-XAA1zk_A2Eg4vOXQ',
  b: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ1lO-PAzjyYEsuvAAHilQ7gPuMilPtZR0ENRVHqPUOGgUNfmWpWjhme0o4F1dnRKmOuHdyOMq8IlK8GvsVzlQMRzhLVXtMdgCMdRD2P7bj31k_3ZqHPRAeqAXo4X4QmSr2MJl28t_1EMxUnA5WxHqMx6T0uHOdb4ztgJX1M3da1m9FnBYKFYCEiEJp1zYpBC4E1AQkvpA3Bswa5Lrna4a4ChCNafOqpz5pPYoUB8P-_hv1ZBHwTvmhg',
  d: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHfhUezQGGm6Cw4HKFuYnYfp1_Eut3-EzXCPnLMAUIpfWiLYN0NMpVA5K6s75SJHn4eZjhU4ZJuX1TDtKctycDS6d3_fO_Q_FNX0VTl3IFAA927cRkdxq6agIUdVbaGJjsD0UI15MeDkJucOhyT9zon21uYlMBz9kRK3b_Ip4_Ch4aldgtNVpq8oJeUukHoGiT7dC2g9bceGT5ZQDgL6eg0luJKDH1rbRpA11rSP7xhOiiNKvqmppBSQ'
}
export function CarePatientPortrait({ patient }: { patient: CareRecordPatient }) {
  const { t } = useTranslation()
  return (
    <span className='relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary-container text-primary'>
      <Icon className='text-3xl' name='elderly' />
      {portraits[patient] && (
        <img
          alt={t(`caregiver.careRecords.${patient}.name`)}
          className='absolute inset-0 h-full w-full object-cover'
          loading='lazy'
          onError={(event) => {
            event.currentTarget.hidden = true
          }}
          src={portraits[patient]}
        />
      )}
    </span>
  )
}
