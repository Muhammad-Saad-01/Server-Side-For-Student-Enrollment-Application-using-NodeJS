const mongoose = require('mongoose')
const Assignmets = require('../models/assignments')
const courseSchema = mongoose.Schema({
  name: {
    type: String, required: true, trim: true
  },
  tags: [String],
  progress: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0 || value > 100) {
        throw new Error('progress Must be between 0 to 100')
      }
    }
  },
  completed: { type: Boolean, default: false },
  stuID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' }


}, {
    timestamps: true
  })


courseSchema.virtual('CourseAssignments', {
  ref: 'Assignments',
  localField: '_id',
  foreignField: 'relatedCourse'
})
courseSchema.statics.getCourseAssignments = async function (id, completed) {

  if (completed === true || completed === false) {
    console.log(completed)
    return await Assignmets.find({ relatedCourse: id, completed })
  }
  else {
    return await Assignmets.find({ relatedCourse: id })
  }

}
courseSchema.statics.getStudentCourses = async function (id) {
  const res = await Course.find({ stuID: id })
  return res
}

courseSchema.statics.courseComplete = async function (id) {
  const ID = mongoose.Types.ObjectId(id)
  console.log(ID)
  const res = await Assignmets.updateMany({ relatedCourse: ID }, { completed: true, progress: 100 })
  console.log(res)
  return res
}
courseSchema.statics.deleteAllRelatesAssignments = async function (id) {
  const res = await Assignmets.deleteMany({ relatedCourse: id })

  return res
}

courseSchema.statics.updateCourseProgressRatio = async function (id) {
  let assignmetsNumber = await Assignmets.find({ relatedCourse: id }).countDocuments()
  let completedAssignmetsNumber = await Assignmets.find({ relatedCourse: id, completed: true }).countDocuments()

  let ratio = (completedAssignmetsNumber / assignmetsNumber) * 100
  const course = await Course.findOne({ _id: id })
  console.log('Step 1 ..... ', course)


  if (ratio) {
    console.log('Step 2 ..... ')
    console.log(assignmetsNumber, completedAssignmetsNumber, ratio)
    if (ratio === 100) {
      console.log('Step 3 Start true if..... ')
      course.completed = true
      course.progress = ratio
      await course.save()
      console.log('Step 3 finish ..... ')
    }
    else {
      console.log('Step 3 Start ..... ')
      course.progress = ratio
      console.log('Step 3 middel ..... ', course)
      await course.save()
      console.log('Step 3 finish ..... ')

    }
  }

}

const Course = mongoose.model('Course', courseSchema)




module.exports = Course 