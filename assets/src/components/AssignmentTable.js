import React, { useState, useEffect, useRef } from 'react'
import { withStyles } from '@material-ui/core/styles'
import TableContainer from '@material-ui/core/TableContainer'
import RootRef from '@material-ui/core/RootRef'
import MTable from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import ProgressBarV2 from './ProgressBarV2'
import AssignmentTablePopover from './AssignmentTablePopover'
import ConditionalWrapper from './ConditionalWrapper'
import { roundToOneDecimal } from '../util/math'
import StyledTextField from './StyledTextField'
import { calculateWeekOffset } from '../util/date'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 8
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary
  },
  container: {
    maxHeight: 500
  },
  sliderCell: {
    minWidth: '150px'
  },
  goalGradeInput: {
    marginTop: 0,
    width: 85
  },
  tableCell: {
    border: 'none'
  },
  tableHeadCell: {
    fontSize: '1em'
  },
  popover: {
    pointerEvents: 'none'
  },
  narrowCell: {
    width: '120px'
  }
})

function AssignmentTable (props) {
  const { classes, assignments, assignmentGroups, dateStart, setGoalGrade } = props

  const [anchorEl, setAnchorEl] = useState(null)

  const tableRef = useRef(null)
  const currentWeekRow = useRef(null)

  const currentDate = new Date()
  const currentWeek = calculateWeekOffset(dateStart, currentDate)

  const maxPercentOfFinalGrade = Math.max(
    ...assignments.map(({ percentOfFinalGrade }) => percentOfFinalGrade)
  )

  const isNextWeekTheSame = (week, key) => {
    return assignments[key + 1]
      ? assignments[key + 1].week === week
      : false
  }

  const isPreviousWeekTheSame = (week, key) => {
    return key >= 1
      ? assignments[key - 1].week === week
      : false
  }

  // this effect scrolls to current week of assignments if it exists
  useEffect(() => {
    if (currentWeekRow.current) {
      const tableHeaderOffset = 120
      tableRef.current.scrollTo({
        top: currentWeekRow.current.offsetTop - tableHeaderOffset,
        behavior: 'smooth'
      })
    }
  })

  return (
    <RootRef rootRef={tableRef}>
      <TableContainer className={classes.container}>
        <MTable stickyHeader ref={tableRef}>
          <TableHead>
            <TableRow>
              {
                [
                  'Week',
                  'Due',
                  'Assignment Name',
                  'Percent of Final Grade',
                  'Score / Out of'
                ].map((heading, key) => (
                  <TableCell
                    className={classes.tableCell + ' ' + classes.tableHeadCell}
                    key={key}
                  >
                    {heading}
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {
              assignments.map((a, key) => (
                <ConditionalWrapper
                  condition={a.week === currentWeek}
                  wrapper={children => <RootRef rootRef={currentWeekRow} key={key}>{children}</RootRef>}
                  key={key}
                >
                  <TableRow key={key}>
                    <TableCell
                      style={{
                        ...isNextWeekTheSame(a.week, key)
                          ? { borderBottom: 'none' }
                          : {},
                        ...a.week === currentWeek
                          ? { color: 'orange' }
                          : {}
                      }}
                      className={classes.narrowCell}
                    >
                      {
                        a.week
                          ? isPreviousWeekTheSame(a.week, key)
                            ? ''
                            : `Week ${a.week}`
                          : 'No due date'
                      }
                    </TableCell>
                    <TableCell
                      style={
                        isNextWeekTheSame(a.week, key)
                          ? { borderBottom: 'none' }
                          : {}
                      }
                      className={classes.narrowCell}
                    >
                      {
                        a.week
                          ? isPreviousWeekTheSame(a.week, key)
                            ? ''
                            : a.dueDateMonthDay
                          : ''
                      }
                    </TableCell>
                    <TableCell style={{ width: '30%' }}>
                      {a.name}
                    </TableCell>
                    <TableCell className={classes.narrowCell}>
                      {`${a.percentOfFinalGrade}%`}
                    </TableCell>
                    <TableCell style={{ width: '30%' }}>
                      {
                        a.graded || a.outOf === 0
                          ? a.outOf === 0
                            ? '0'
                            : `${a.currentUserSubmission.score}`
                          : (
                            <StyledTextField
                              error={(a.goalGrade / a.pointsPossible) > 1}
                              id='standard-number'
                              value={roundToOneDecimal(a.goalGrade) || ''}
                              label={
                                (a.goalGrade / a.pointsPossible) > 1
                                  ? 'Over 100%'
                                  : 'Set a goal'
                              }
                              onChange={event => setGoalGrade(key, event.target.value)}
                              type='number'
                              className={classes.goalGradeInput}
                              style={{ marginBottom: '10px' }}
                            />
                          )
                      }
                      {
                        <div style={{ margin: 'auto', display: 'inline' }}>
                          {` / ${a.outOf}`}
                        </div>
                      }
                      <div
                        onMouseEnter={event => setAnchorEl(event.currentTarget)}
                        onMouseLeave={() => setAnchorEl(null)}
                      >
                        <ProgressBarV2
                          score={a.currentUserSubmission ? a.currentUserSubmission.score : 0}
                          outOf={a.outOf}
                          goalGrade={a.goalGrade}
                          percentWidth={a.percentOfFinalGrade / maxPercentOfFinalGrade * 70}
                          displayLabel
                          lines={
                            a.goalGrade
                              ? [{ color: 'green', value: a.goalGrade, draggable: true }]
                              : []
                          }
                        />
                        <AssignmentTablePopover
                          anchorEl={anchorEl}
                          assignmentGroup={assignmentGroups}
                          a={a}
                          setAnchorEl={setAnchorEl}
                          {...props}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </ConditionalWrapper>
              ))
            }
          </TableBody>
        </MTable>
      </TableContainer>
    </RootRef>
  )
}

export default withStyles(styles)(AssignmentTable)
