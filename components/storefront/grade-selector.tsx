'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { GraduationCap, Sparkles } from 'lucide-react'

interface Grade {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  productCount?: number
}

interface GradeSelectorProps {
  grades?: Grade[]
  selectedGrade?: string
  showProductCount?: boolean
  className?: string
}

// Default grades if none provided
const defaultGrades: Grade[] = [
  { id: 'r', name: 'Grade R', slug: 'grade-r', description: 'Reception year essentials' },
  { id: '1', name: 'Grade 1', slug: 'grade-1', description: 'First year basics' },
  { id: '2', name: 'Grade 2', slug: 'grade-2', description: 'Second year supplies' },
  { id: '3', name: 'Grade 3', slug: 'grade-3', description: 'Third year materials' },
  { id: '4', name: 'Grade 4', slug: 'grade-4', description: 'Intermediate phase start' },
  { id: '5', name: 'Grade 5', slug: 'grade-5', description: 'Fifth year equipment' },
  { id: '6', name: 'Grade 6', slug: 'grade-6', description: 'Sixth year stationery' },
  { id: '7', name: 'Grade 7', slug: 'grade-7', description: 'Senior phase begins' },
  { id: '8', name: 'Grade 8', slug: 'grade-8', description: 'High school start' },
  { id: '9', name: 'Grade 9', slug: 'grade-9', description: 'Ninth grade supplies' },
  { id: '10', name: 'Grade 10', slug: 'grade-10', description: 'FET phase start' },
  { id: '11', name: 'Grade 11', slug: 'grade-11', description: 'Eleventh year materials' },
  { id: '12', name: 'Grade 12', slug: 'grade-12', description: 'Matric essentials' },
]

// Phase groupings - matched by slug with brand-aware colors
const phases = [
  { name: 'Foundation Phase', slugs: ['grade-r', 'grade-1', 'grade-2', 'grade-3'], color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Intermediate Phase', slugs: ['grade-4', 'grade-5', 'grade-6'], color: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600' },
  { name: 'Senior Phase', slugs: ['grade-7', 'grade-8', 'grade-9'], color: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600' },
  { name: 'FET Phase', slugs: ['grade-10', 'grade-11', 'grade-12'], color: 'bg-rose-500', gradient: 'from-rose-400 to-rose-600' },
]

export function GradeSelector({
  grades = defaultGrades,
  selectedGrade,
  showProductCount = false,
  className,
}: GradeSelectorProps) {
  return (
    <div className={cn('w-full', className)} data-testid="grade-selector">
      {/* Mobile: Horizontal scroll with snap */}
      <div className="md:hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 overflow-x-auto pb-4 px-1 -mx-1 scrollbar-hide snap-x snap-mandatory"
        >
          {grades.map((grade, index) => (
            <GradeCard
              key={grade.id}
              grade={grade}
              isSelected={selectedGrade === grade.slug}
              showProductCount={showProductCount}
              compact
              index={index}
            />
          ))}
        </motion.div>
      </div>

      {/* Desktop: Grid with stagger animation */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
          }
        }}
        className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4"
      >
        {grades.map((grade, index) => (
          <GradeCard
            key={grade.id}
            grade={grade}
            isSelected={selectedGrade === grade.slug}
            showProductCount={showProductCount}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  )
}

interface GradeCardProps {
  grade: Grade
  isSelected?: boolean
  showProductCount?: boolean
  compact?: boolean
  index?: number
}

function GradeCard({ grade, isSelected, showProductCount, compact, index = 0 }: GradeCardProps) {
  // Get phase color by matching slug
  const phase = phases.find((p) => p.slugs.includes(grade.slug))
  const phaseColor = phase?.color || 'bg-gray-500'
  const phaseGradient = phase?.gradient || 'from-gray-400 to-gray-600'
  const [isHovered, setIsHovered] = useState(false)

  const gradeNumber = grade.name.replace('Grade ', '')
  const isMatric = grade.slug === 'grade-12'

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
            delay: index * 0.03
          }
        }
      }}
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={compact ? 'snap-center flex-shrink-0' : ''}
    >
      <Link
        href={`/grades/${grade.slug}`}
        data-testid={grade.slug}
        className={cn(
          'group relative flex flex-col items-center justify-center',
          'rounded-2xl border-2 transition-all duration-300',
          'hover:shadow-xl hover:shadow-primary/15',
          // Minimum touch target size (48px)
          compact ? 'min-w-[90px] p-4' : 'p-6',
          isSelected
            ? 'border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/10'
            : 'border-gray-100 bg-white hover:border-primary/40 hover:bg-gradient-to-br hover:from-white hover:to-primary/5'
        )}
      >
        {/* Animated phase indicator dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2, type: 'spring', stiffness: 500 }}
          className="absolute top-2.5 right-2.5"
        >
          <motion.div
            animate={isHovered ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              phaseColor
            )}
          />
        </motion.div>

        {/* Matric badge */}
        {isMatric && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="absolute -top-2 left-1/2 -translate-x-1/2"
          >
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 rounded-full shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Matric
            </span>
          </motion.div>
        )}

        {/* Grade number/letter with gradient on hover */}
        <motion.div
          className={cn(
            'font-bold text-center transition-all duration-300',
            compact ? 'text-3xl' : 'text-4xl',
            isSelected
              ? `bg-gradient-to-br ${phaseGradient} bg-clip-text text-transparent`
              : 'text-gray-800 group-hover:text-primary'
          )}
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {gradeNumber}
        </motion.div>

        {/* Label */}
        <motion.div
          className={cn(
            'text-center mt-1.5 font-medium transition-colors',
            compact ? 'text-xs' : 'text-sm',
            isSelected ? 'text-primary' : 'text-gray-500 group-hover:text-primary/70'
          )}
        >
          {compact ? grade.name : 'Grade'}
        </motion.div>

        {/* Product count with animation */}
        {showProductCount && grade.productCount !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-400 mt-2 font-medium"
          >
            {grade.productCount} items
          </motion.div>
        )}

        {/* Hover glow effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          className={cn(
            'absolute inset-0 rounded-2xl blur-xl -z-10',
            phaseColor
          )}
        />
      </Link>
    </motion.div>
  )
}

/**
 * Compact grade selector for filters with pill design
 */
export function GradeSelectorCompact({
  grades = defaultGrades,
  selectedGrade,
  onSelect,
  useLinks = true,
  className,
}: {
  grades?: Grade[]
  selectedGrade?: string
  onSelect?: (slug: string) => void
  useLinks?: boolean
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {grades.map((grade, index) => {
        const phase = phases.find((p) => p.slugs.includes(grade.slug))
        const isSelected = selectedGrade === grade.slug

        const buttonContent = (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid={`grade-filter-${grade.slug}`}
            className={cn(
              'inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200',
              'min-h-[44px] min-w-[44px] border-2', // Touch target
              isSelected
                ? `bg-gradient-to-r ${phase?.gradient || 'from-primary to-primary/80'} text-white border-transparent shadow-lg`
                : 'bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:bg-primary/5'
            )}
          >
            {grade.name.replace('Grade ', 'Gr ')}
          </motion.span>
        )

        if (useLinks) {
          return (
            <Link
              key={grade.id}
              href={`/grades/${grade.slug}`}
              className="inline-block"
            >
              {buttonContent}
            </Link>
          )
        }

        return (
          <button
            key={grade.id}
            onClick={() => onSelect?.(grade.slug)}
            className="inline-block"
          >
            {buttonContent}
          </button>
        )
      })}
    </motion.div>
  )
}

/**
 * Phase-grouped grade selector with beautiful animations
 */
export function GradeSelectorByPhase({
  grades = defaultGrades,
  selectedGrade,
  className,
}: GradeSelectorProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {phases.map((phase, phaseIndex) => {
        const phaseGrades = grades.filter((g) => phase.slugs.includes(g.slug))
        if (phaseGrades.length === 0) return null

        return (
          <motion.div
            key={phase.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: phaseIndex * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 500, delay: phaseIndex * 0.1 }}
                className={cn('w-4 h-4 rounded-full shadow-lg', phase.color)}
              />
              <h3 className="font-bold text-gray-800 text-lg">{phase.name}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: phaseIndex * 0.1 }
                }
              }}
              className="grid grid-cols-4 gap-4"
            >
              {phaseGrades.map((grade, index) => (
                <GradeCard
                  key={grade.id}
                  grade={grade}
                  isSelected={selectedGrade === grade.slug}
                  compact
                  index={index}
                />
              ))}
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

/**
 * Hero section grade selector for homepage
 */
export function GradeSelectorHero({
  grades = defaultGrades,
  className,
}: {
  grades?: Grade[]
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn('text-center', className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <GraduationCap className="w-6 h-6 text-accent" />
        <h2 className="text-xl font-bold text-gray-800">Shop by Grade</h2>
      </motion.div>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Select your child&apos;s grade to see their complete stationery requirements
      </p>
      <GradeSelector grades={grades} className="max-w-4xl mx-auto" />
    </motion.div>
  )
}
