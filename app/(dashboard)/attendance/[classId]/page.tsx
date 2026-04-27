import React from "react"

import AttendanceClassContainer from "@/app/common/pages/attendance/AttendanceClassContainer"

const page = async ({ params }: { params: Promise<{ classId: string }> }) => {
    const { classId } = await params
  return (
    <div>
      <AttendanceClassContainer classId={classId} />
    </div>
  )
}

export default page