import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, Typography, Button, Box, Chip, Avatar, Rating,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

// Deterministic avatar color based on name
const avatarColors = [
  "#2563EB", "#7C3AED", "#DB2777", "#059669", "#D97706", "#DC2626",
];
function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}
function getInitials(name) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function UserCard({ user }) {
  const navigate = useNavigate();
  const color = getAvatarColor(user.name);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        "&:hover": { transform: "translateY(-2px)" },
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onClick={() => navigate(`/user/${user._id}`)}
    >
      <CardContent sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 44, height: 44, fontSize: 15, fontWeight: 700 }}>
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {user.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 12, color: "#94A3B8" }} />
              <Typography variant="caption" color="text.secondary">
                {user.city}
              </Typography>
            </Box>
          </Box>
          <Rating value={user.rating} readOnly size="small" precision={0.5} />
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.6,
          }}
        >
          {user.description}
        </Typography>

        {/* Skills offered */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.8, display: "block" }}>
            TEACHES
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
            {user.skillsOffered.slice(0, 3).map((s, i) => (
              <Chip
                key={i}
                label={s}
                size="small"
                sx={{
                  bgcolor: "rgba(37,99,235,0.08)",
                  color: "#2563EB",
                  fontWeight: 600,
                  fontSize: 11,
                  height: 22,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Skills wanted */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 0.8, display: "block" }}>
            WANTS TO LEARN
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
            {user.skillsWanted.slice(0, 3).map((s, i) => (
              <Chip
                key={i}
                label={s}
                size="small"
                variant="outlined"
                sx={{ fontSize: 11, height: 22, borderColor: "#E2E8F0", color: "#64748B" }}
              />
            ))}
          </Box>
        </Box>

        {/* Button */}
        <Button
          variant="contained"
          fullWidth
          size="small"
          sx={{ mt: "auto", py: 1, fontSize: 13 }}
          onClick={(e) => { e.stopPropagation(); navigate(`/user/${user._id}`); }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserCard;
