import React, { createContext, useContext } from 'react';
import { Grid } from 'antd';

const DeviceContext = createContext({ isMobile: false, isTablet: false, isDesktop: true });

export const DeviceProvider = ({ children }) => {
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;        // < 992px
  const isTablet = screens.md && !screens.lg; // 768-991px
  const isDesktop = !!screens.lg;      // >= 992px

  return (
    <DeviceContext.Provider value={{ isMobile, isTablet, isDesktop }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => useContext(DeviceContext);

export default DeviceContext;
