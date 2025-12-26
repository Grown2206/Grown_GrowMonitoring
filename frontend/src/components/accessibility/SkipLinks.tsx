import React from 'react';
import { Box, Link } from '@mui/material';
import { useSkipLink } from '../../hooks/useAccessibility';

export interface SkipLink {
  id: string;
  label: string;
  targetId: string;
}

export interface SkipLinksProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { id: 'skip-to-main', label: 'Zum Hauptinhalt springen', targetId: 'main-content' },
  { id: 'skip-to-nav', label: 'Zur Navigation springen', targetId: 'main-navigation' },
  { id: 'skip-to-footer', label: 'Zum Footer springen', targetId: 'footer' },
];

/**
 * Skip Links component for keyboard navigation
 * Shows links that allow users to skip to main content sections
 */
export function SkipLinks({ links = defaultLinks }: SkipLinksProps) {
  return (
    <Box
      component="nav"
      aria-label="Skip links"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        '& a': {
          position: 'absolute',
          left: '-10000px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          '&:focus': {
            position: 'fixed',
            top: 8,
            left: 8,
            width: 'auto',
            height: 'auto',
            padding: '8px 16px',
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            textDecoration: 'none',
            borderRadius: 1,
            zIndex: 10000,
            boxShadow: 3,
          },
        },
      }}
    >
      {links.map((link) => (
        <SkipLinkItem key={link.id} {...link} />
      ))}
    </Box>
  );
}

function SkipLinkItem({ label, targetId }: SkipLink) {
  const handleSkip = useSkipLink(targetId);

  return (
    <Link
      href={`#${targetId}`}
      onClick={handleSkip as any}
      sx={{ display: 'block' }}
    >
      {label}
    </Link>
  );
}
