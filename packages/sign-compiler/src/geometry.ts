import { Matrix4, Quaternion, Vector3 } from 'three'

export type Side = 'left' | 'right'

export const FINGER_HINGE_AXIS: Record<Side, Vector3> = {
  left: new Vector3(0, 0, -1),
  right: new Vector3(0, 0, 1),
}

export const MCP_FAN_AXIS = new Vector3(0, 1, 0)

export const MCP_FLEX_MAX_DEG = 90
export const HINGE_FLEX_MAX_DEG = 110
export const MCP_FAN_MAX_DEG = 20
export const THUMB_FLEX_MAX_DEG = 110

export const toRad = (degrees: number) => (degrees * Math.PI) / 180
export const toDeg = (radians: number) => (radians * 180) / Math.PI

export const frameFromDirections = (forward: Vector3, across: Vector3, side: Side): Quaternion => {
  const normal = new Vector3().crossVectors(forward, across).normalize()
  if (side === 'left') normal.negate()
  return frameFromForwardNormal(forward, normal)
}

export const frameFromForwardNormal = (forward: Vector3, normal: Vector3): Quaternion => {
  const sideAxis = new Vector3().crossVectors(forward, normal).normalize()
  const trueForward = new Vector3().crossVectors(normal, sideAxis).normalize()
  return new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(sideAxis, trueForward, normal.clone().normalize()),
  )
}

export const twistAbout = (q: Quaternion, axis: Vector3): { twist: Quaternion; deg: number } => {
  const dot = q.x * axis.x + q.y * axis.y + q.z * axis.z
  const twist = new Quaternion(axis.x * dot, axis.y * dot, axis.z * dot, q.w)
  if (twist.lengthSq() < 1e-12) {
    return { twist: new Quaternion(), deg: 0 }
  }
  twist.normalize()
  if (twist.w < 0) twist.set(-twist.x, -twist.y, -twist.z, -twist.w)
  const vectorDot = twist.x * axis.x + twist.y * axis.y + twist.z * axis.z
  const rad = 2 * Math.atan2(vectorDot, twist.w)
  return { twist, deg: toDeg(rad) }
}
